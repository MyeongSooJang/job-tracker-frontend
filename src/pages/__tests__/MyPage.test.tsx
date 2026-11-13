import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Profile } from '@/api/types'
import MyPage from '../MyPage'

const updateMutate = vi.fn()
let profileState: { data?: Profile; isLoading: boolean; isError: boolean }

const profile: Profile = {
  email: 'hong@example.com',
  name: '홍길동',
  phone: '010-1234-5678',
  birthDate: null,
  jobSearchStartDate: null,
  address: null,
  githubUrl: 'https://github.com/hong',
  blogUrl: null,
  portfolioUrl: null,
  education: null,
  career: null,
  desiredJob: '백엔드 개발자',
  introduction: null,
  files: [
    { id: 2, type: 'PORTFOLIO', fileName: '포트폴리오.pdf', sizeBytes: 4096, createdAt: '2026-11-02T10:00:00' },
    { id: 1, type: 'RESUME', fileName: '이력서.pdf', sizeBytes: 2048, createdAt: '2026-11-01T10:00:00' },
  ],
}

vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => profileState,
  useUpdateProfile: () => ({ mutate: updateMutate, isPending: false, error: null, reset: vi.fn() }),
  useUploadFile: () => ({ mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() }),
  useDeleteFile: () => ({ mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() }),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
)

describe('MyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    profileState = { data: profile, isLoading: false, isError: false }
  })

  it('프로필 요약과 완성도를 보여준다', () => {
    render(<MyPage />, { wrapper })

    expect(screen.getByRole('heading', { level: 1, name: '홍길동' })).toBeInTheDocument()
    expect(screen.getByText(/백엔드 개발자/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: '프로필 완성도' })).toHaveAttribute('aria-valuenow', '44')
  })

  it('불러오는 중이면 로딩 문구를 보여준다', () => {
    profileState = { isLoading: true, isError: false }
    render(<MyPage />, { wrapper })

    expect(screen.getByText('불러오는 중...')).toBeInTheDocument()
  })

  it('불러오지 못하면 오류 문구를 보여준다', () => {
    profileState = { isLoading: false, isError: true }
    render(<MyPage />, { wrapper })

    expect(screen.getByText('프로필을 불러오지 못했습니다.')).toBeInTheDocument()
  })

  it('처음에는 기본 정보 섹션을 보여주고 탭으로 다른 섹션으로 이동한다', async () => {
    const user = userEvent.setup()
    render(<MyPage />, { wrapper })

    expect(screen.getByRole('heading', { level: 2, name: '기본 정보' })).toBeInTheDocument()
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '링크' }))

    expect(screen.getByRole('heading', { level: 2, name: '링크' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://github.com/hong' })).toHaveAttribute('href', 'https://github.com/hong')
  })

  it('파일 탭에서 프로필 응답의 파일을 서버가 준 순서 그대로 종류와 함께 보여준다', async () => {
    const user = userEvent.setup()
    render(<MyPage />, { wrapper })

    await user.click(screen.getByRole('button', { name: '파일' }))

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('포트폴리오.pdf')
    expect(items[0]).toHaveTextContent('포트폴리오')
    expect(items[1]).toHaveTextContent('이력서.pdf')
    expect(items[1]).toHaveTextContent(/2\.0KB/)
  })

  it('파일이 없으면 완성도에서 파일 항목이 빠지고 빈 목록 안내를 보여준다', async () => {
    const user = userEvent.setup()
    profileState = { data: { ...profile, files: [] }, isLoading: false, isError: false }
    render(<MyPage />, { wrapper })

    expect(screen.getByRole('progressbar', { name: '프로필 완성도' })).toHaveAttribute('aria-valuenow', '33')
    await user.click(screen.getByRole('button', { name: '파일' }))
    expect(screen.getByText('등록된 파일이 없습니다.')).toBeInTheDocument()
  })

  it('수정 후 저장하면 바뀐 값과 기존 값을 합쳐 전체 프로필을 저장한다', async () => {
    const user = userEvent.setup()
    render(<MyPage />, { wrapper })

    await user.click(screen.getByRole('button', { name: '기본 정보 수정' }))
    const phone = screen.getByLabelText('연락처')
    await user.clear(phone)
    await user.type(phone, '010-9999-9999')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(updateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '홍길동',
        phone: '010-9999-9999',
        githubUrl: 'https://github.com/hong',
        desiredJob: '백엔드 개발자',
        birthDate: null,
        jobSearchStartDate: null,
      }),
      expect.any(Object),
    )
  })

  it('수정을 취소하면 저장하지 않고 읽기 화면으로 돌아간다', async () => {
    const user = userEvent.setup()
    render(<MyPage />, { wrapper })

    await user.click(screen.getByRole('button', { name: '기본 정보 수정' }))
    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(updateMutate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '기본 정보 수정' })).toBeInTheDocument()
  })
})
