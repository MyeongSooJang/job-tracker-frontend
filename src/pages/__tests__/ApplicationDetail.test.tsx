import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeAll, beforeEach, describe, it, expect, vi } from 'vitest'
import ApplicationDetail from '../ApplicationDetail'

const jobSiteMutate = vi.hoisted(() => vi.fn())
const application = vi.hoisted(() => ({
  current: {
    id: 1, company: { name: '카카오' }, position: '백엔드', status: 'RESUME_SUBMITTED',
    appliedDate: '2026-10-01', jobSite: null as string | null, createdAt: '',
    deadline: null as string | null, resumeView: 'NOT_VIEWED', autoRejectedAt: null as string | null,
  },
  second: {
    id: 2, company: { name: '네이버' }, position: '프론트엔드', status: 'RESUME_SUBMITTED',
    appliedDate: '2026-10-02', jobSite: null as string | null, createdAt: '',
    deadline: '2026-12-25', resumeView: 'NOT_VIEWED', autoRejectedAt: null as string | null,
  },
}))

vi.mock('@/hooks/useApplications', () => ({
  useApplication: (id: number) => ({
    data: id === 2 ? application.second : application.current, isLoading: false,
  }),
  useUpdateApplicationStatus: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateApplicationJobSite: () => ({ mutate: jobSiteMutate, isPending: false }),
  useUpdateApplicationDeadline: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateApplicationResumeView: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/useReviews', () => ({
  useReviews: () => ({ data: [], isLoading: false }),
  useWriteReview: () => ({ mutate: vi.fn(), isPending: false }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}>
    <MemoryRouter initialEntries={['/applications/1']}>
      <Routes><Route path="/applications/:id" element={children} /></Routes>
    </MemoryRouter>
  </QueryClientProvider>
)

// Radix Select가 jsdom에서 열리도록 브라우저 API를 보정한다.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
})

beforeEach(() => {
  jobSiteMutate.mockClear()
  application.current.jobSite = null
  application.current.deadline = null
})

describe('ApplicationDetail', () => {
  it('회사명과 직무를 렌더링한다', () => {
    render(<ApplicationDetail />, { wrapper })
    expect(screen.getByText('카카오')).toBeInTheDocument()
    expect(screen.getByText('백엔드')).toBeInTheDocument()
  })

  it('지정한 지원 사이트를 보여준다', () => {
    application.current.jobSite = 'WANTED'

    render(<ApplicationDetail />, { wrapper })

    expect(screen.getByRole('combobox', { name: '지원 사이트' })).toHaveTextContent('Wanted')
  })

  it('이전에 등록한 지원 건은 미지정으로 보여준다', () => {
    render(<ApplicationDetail />, { wrapper })

    expect(screen.getByRole('combobox', { name: '지원 사이트' })).toHaveTextContent('미지정')
  })

  it('지원 사이트를 고르면 선택한 사이트로 변경을 요청한다', async () => {
    render(<ApplicationDetail />, { wrapper })

    await userEvent.click(screen.getByRole('combobox', { name: '지원 사이트' }))
    await userEvent.click(await screen.findByRole('option', { name: '사람인' }))

    expect(jobSiteMutate).toHaveBeenCalledWith('SARAMIN')
  })

  it('공고 마감일과 열람 여부 섹션을 보여준다', () => {
    application.current.deadline = '2026-10-10'

    render(<ApplicationDetail />, { wrapper })

    expect(screen.getByLabelText('공고 마감일')).toHaveValue('2026-10-10')
    expect(screen.getByText('미열람')).toBeInTheDocument()
  })

  it('다른 지원 건으로 이동하면 마감일 입력도 그 지원 건의 값으로 바뀐다', async () => {
    application.current.deadline = '2026-10-10'
    let goTo: (path: string) => void = () => {}
    const Navigator = () => {
      const navigate = useNavigate()
      goTo = navigate
      return null
    }

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/applications/1']}>
          <Navigator />
          <Routes><Route path="/applications/:id" element={<ApplicationDetail />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(screen.getByLabelText('공고 마감일')).toHaveValue('2026-10-10')

    act(() => goTo('/applications/2'))

    expect(screen.getByLabelText('공고 마감일')).toHaveValue('2026-12-25')
  })
})
