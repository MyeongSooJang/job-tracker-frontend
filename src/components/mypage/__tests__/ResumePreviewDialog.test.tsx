import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { downloadResume } from '@/api/profile'
import { loadPdf } from '@/lib/pdf'
import ResumePreviewDialog from '../ResumePreviewDialog'

vi.mock('@/api/profile', () => ({ downloadResume: vi.fn() }))
vi.mock('@/lib/pdf', () => ({ loadPdf: vi.fn() }))
vi.mock('../PdfPageCanvas', () => ({
  default: ({ pageNumber }: { pageNumber: number }) => <div data-testid="page">{pageNumber}페이지</div>,
}))

const fakePdf = (pageCount: number) => ({
  pageCount,
  renderPage: vi.fn(),
  destroy: vi.fn().mockResolvedValue(undefined),
})

const renderOpen = () =>
  render(<ResumePreviewDialog open onOpenChange={() => {}} fileName="이력서.pdf" />)

describe('ResumePreviewDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(downloadResume).mockResolvedValue(new Blob(['%PDF-1.7']))
  })

  it('첫 페이지와 전체 페이지 수를 보여준다', async () => {
    vi.mocked(loadPdf).mockResolvedValue(fakePdf(3))
    renderOpen()

    expect(await screen.findByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByTestId('page')).toHaveTextContent('1페이지')
  })

  it('다음/이전 버튼으로 한 페이지씩 이동하고 양 끝에서는 비활성화된다', async () => {
    const user = userEvent.setup()
    vi.mocked(loadPdf).mockResolvedValue(fakePdf(2))
    renderOpen()
    await screen.findByText('1 / 2')

    expect(screen.getByRole('button', { name: '이전 페이지' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '다음 페이지' }))

    expect(screen.getByText('2 / 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다음 페이지' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '이전 페이지' }))
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('좌우 방향키로도 페이지를 이동한다', async () => {
    const user = userEvent.setup()
    vi.mocked(loadPdf).mockResolvedValue(fakePdf(3))
    renderOpen()
    await screen.findByText('1 / 3')

    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('한 페이지짜리 PDF에는 페이지 이동 UI를 보여주지 않는다', async () => {
    vi.mocked(loadPdf).mockResolvedValue(fakePdf(1))
    renderOpen()

    expect(await screen.findByTestId('page')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '다음 페이지' })).not.toBeInTheDocument()
  })

  it('불러오기에 실패하면 오류를 안내한다', async () => {
    vi.mocked(downloadResume).mockRejectedValue(new Error('network'))
    renderOpen()

    expect(await screen.findByRole('alert')).toHaveTextContent('이력서를 불러오지 못했습니다.')
  })
})
