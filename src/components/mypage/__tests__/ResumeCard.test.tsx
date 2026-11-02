import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadResume } from '@/api/profile'
import ResumeCard from '../ResumeCard'

const uploadMutate = vi.fn()
const deleteMutate = vi.fn()

vi.mock('@/hooks/useProfile', () => ({
  useUploadResume: () => ({ mutate: uploadMutate, isPending: false, error: null, reset: vi.fn() }),
  useDeleteResume: () => ({ mutate: deleteMutate, isPending: false, error: null, reset: vi.fn() }),
}))

vi.mock('@/api/profile', () => ({ downloadResume: vi.fn() }))

const resume = { fileName: '이력서.pdf', sizeBytes: 2048, updatedAt: '2026-11-01T10:00:00' }

const chooseFile = (file: File) =>
  fireEvent.change(screen.getByLabelText('이력서 파일 선택'), { target: { files: [file] } })

describe('ResumeCard', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('이력서가 없으면 업로드 안내를 보여준다', () => {
    render(<ResumeCard resume={null} />)

    expect(screen.getByText('PDF · 최대 5MB')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '파일 선택' })).toBeInTheDocument()
  })

  it('PDF를 선택하면 업로드를 요청한다', () => {
    render(<ResumeCard resume={null} />)
    const file = new File(['%PDF-1.7'], '이력서.pdf', { type: 'application/pdf' })

    chooseFile(file)

    expect(uploadMutate).toHaveBeenCalledWith(file)
  })

  it('PDF가 아닌 파일은 업로드하지 않고 안내한다', () => {
    render(<ResumeCard resume={null} />)

    chooseFile(new File(['x'], '이력서.docx', { type: 'application/msword' }))

    expect(screen.getByRole('alert')).toHaveTextContent('PDF 파일만 업로드할 수 있습니다.')
    expect(uploadMutate).not.toHaveBeenCalled()
  })

  it('5MB를 넘는 파일은 업로드하지 않고 안내한다', () => {
    render(<ResumeCard resume={null} />)

    chooseFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.pdf', { type: 'application/pdf' }))

    expect(screen.getByRole('alert')).toHaveTextContent('파일 크기는 5MB 이하여야 합니다.')
    expect(uploadMutate).not.toHaveBeenCalled()
  })

  it('끌어다 놓은 PDF도 업로드한다', () => {
    render(<ResumeCard resume={null} />)
    const file = new File(['%PDF-1.7'], 'drop.pdf', { type: 'application/pdf' })

    fireEvent.drop(screen.getByText('이력서 PDF 파일을 여기로 끌어다 놓으세요'), {
      dataTransfer: { files: [file] },
    })

    expect(uploadMutate).toHaveBeenCalledWith(file)
  })

  it('등록된 이력서의 파일명, 용량, 업로드 시각을 보여준다', () => {
    render(<ResumeCard resume={resume} />)

    expect(screen.getByText('이력서.pdf')).toBeInTheDocument()
    expect(screen.getByText(/2\.0KB · 2026\.11\.01 10:00 업로드/)).toBeInTheDocument()
  })

  it('미리보기 버튼을 누르면 미리보기 창이 열린다', async () => {
    const user = userEvent.setup()
    vi.mocked(downloadResume).mockReturnValue(new Promise(() => {}))
    render(<ResumeCard resume={resume} />)

    await user.click(screen.getByRole('button', { name: '이력서 미리보기' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument()
  })

  it('삭제를 확인하면 삭제를 요청하고, 취소하면 요청하지 않는다', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm')
    render(<ResumeCard resume={resume} />)

    confirm.mockReturnValueOnce(false)
    await user.click(screen.getByRole('button', { name: '이력서 삭제' }))
    expect(deleteMutate).not.toHaveBeenCalled()

    confirm.mockReturnValueOnce(true)
    await user.click(screen.getByRole('button', { name: '이력서 삭제' }))
    expect(deleteMutate).toHaveBeenCalledTimes(1)
  })

  it('다운로드하면 서버에서 받은 파일을 원래 파일명으로 저장한다', async () => {
    const user = userEvent.setup()
    vi.mocked(downloadResume).mockResolvedValue(new Blob(['%PDF-1.7']))
    URL.createObjectURL = vi.fn(() => 'blob:resume')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<ResumeCard resume={resume} />)

    await user.click(screen.getByRole('button', { name: '이력서 다운로드' }))

    await waitFor(() => expect(click).toHaveBeenCalledTimes(1))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:resume')
  })

  it('다운로드에 실패하면 오류를 안내한다', async () => {
    const user = userEvent.setup()
    vi.mocked(downloadResume).mockRejectedValue(new Error('network'))
    render(<ResumeCard resume={resume} />)

    await user.click(screen.getByRole('button', { name: '이력서 다운로드' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('이력서를 다운로드하지 못했습니다.')
  })
})
