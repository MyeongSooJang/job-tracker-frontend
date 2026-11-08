import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Reviews from '../Reviews'

const writeMutate = vi.hoisted(() => vi.fn())
const useReviews = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useReviews', () => ({
  useReviews: () => useReviews(),
  useWriteReview: () => ({ mutate: writeMutate, isPending: false }),
}))

const application = {
  id: 1,
  company: { id: 1, name: '카카오', industry: 'IT', website: '', createdAt: '' },
  position: '백엔드',
  status: 'INTERVIEW',
  appliedDate: '2026-10-01',
  createdAt: '',
}

const emptyReview = {
  id: 7,
  application,
  content: null,
  rating: null,
  createdAt: '2026-10-28T10:00:00',
  updatedAt: '2026-10-28T10:00:00',
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

const group = (name: string) => within(screen.getByRole('group', { name }))

beforeEach(() => {
  writeMutate.mockClear()
  useReviews.mockReturnValue({ data: [emptyReview], isLoading: false, isError: false })
})

describe('Reviews', () => {
  it('내 면접 기록 화면이며 각 기록에 저장하면 공개된다는 점을 알려 준다', () => {
    render(<Reviews />, { wrapper })

    expect(screen.getByRole('heading', { name: '내 면접 기록' })).toBeInTheDocument()
    expect(screen.getByText(/익명으로 공개/)).toBeInTheDocument()
  })

  it('자동 생성된 후기를 작성 전 상태로 보여준다', () => {
    render(<Reviews />, { wrapper })
    expect(screen.getByText('카카오')).toBeInTheDocument()
    expect(screen.getByText('작성 전')).toBeInTheDocument()
  })

  it('후기를 입력하고 평점을 고르기 전에는 저장할 수 없다', async () => {
    render(<Reviews />, { wrapper })
    const save = screen.getByRole('button', { name: '저장' })

    await userEvent.type(screen.getByLabelText('카카오 후기'), '분위기가 좋았다')

    expect(save).toBeDisabled()
  })

  it('후기와 평점만 입력하면 면접 상세는 비워서 전송한다', async () => {
    render(<Reviews />, { wrapper })
    const save = screen.getByRole('button', { name: '저장' })

    await userEvent.type(screen.getByLabelText('카카오 후기'), '분위기가 좋았다')
    await userEvent.click(screen.getByRole('button', { name: '4점' }))
    await userEvent.click(save)

    expect(writeMutate).toHaveBeenCalledWith({
      id: 7,
      data: {
        content: '분위기가 좋았다',
        rating: 4,
        difficulty: null,
        atmosphere: null,
        route: null,
        questions: [],
      },
    })
  })

  it('난이도, 분위기, 지원 경로, 받은 질문을 함께 전송한다', async () => {
    render(<Reviews />, { wrapper })

    await userEvent.type(screen.getByLabelText('카카오 후기'), '분위기가 좋았다')
    await userEvent.click(screen.getByRole('button', { name: '4점' }))
    await userEvent.click(group('난이도').getByRole('button', { name: '어려움' }))
    await userEvent.click(group('분위기').getByRole('button', { name: '경직' }))
    await userEvent.click(group('지원 경로').getByRole('button', { name: '지인 추천' }))
    await userEvent.type(screen.getByLabelText('카카오 받은 질문'), '자기소개{enter}  트랜잭션 격리 수준  ')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(writeMutate).toHaveBeenCalledWith({
      id: 7,
      data: {
        content: '분위기가 좋았다',
        rating: 4,
        difficulty: 4,
        atmosphere: 'TENSE',
        route: 'REFERRAL',
        questions: ['자기소개', '트랜잭션 격리 수준'],
      },
    })
  })

  it('이미 고른 선택지를 다시 누르면 선택이 해제된다', async () => {
    render(<Reviews />, { wrapper })
    const hard = group('난이도').getByRole('button', { name: '어려움' })

    await userEvent.click(hard)
    expect(hard).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(hard)

    expect(hard).toHaveAttribute('aria-pressed', 'false')
  })

  it('저장된 면접 상세를 폼에 복원하고 바꾸기 전에는 저장할 수 없다', () => {
    useReviews.mockReturnValue({
      data: [
        {
          ...emptyReview,
          content: '분위기가 좋았다',
          rating: 3,
          difficulty: 4,
          atmosphere: 'TENSE',
          route: 'REFERRAL',
          questions: ['자기소개'],
        },
      ],
      isLoading: false,
      isError: false,
    })
    render(<Reviews />, { wrapper })

    expect(group('난이도').getByRole('button', { name: '어려움' })).toHaveAttribute('aria-pressed', 'true')
    expect(group('분위기').getByRole('button', { name: '경직' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('카카오 받은 질문')).toHaveValue('자기소개')
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })
})
