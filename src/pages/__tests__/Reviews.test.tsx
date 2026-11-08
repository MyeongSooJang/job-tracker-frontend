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

  describe('여러 건일 때', () => {
    const reviewOf = (id: number, name: string, position: string, createdAt: string, extra = {}) => ({
      ...emptyReview,
      id,
      application: {
        ...application,
        id,
        company: { ...application.company, id, name },
        position,
      },
      createdAt,
      ...extra,
    })

    // 최신순으로 카카오, 토스, 네이버
    beforeEach(() => {
      useReviews.mockReturnValue({
        data: [
          reviewOf(3, '네이버', '프론트엔드', '2026-10-20T10:00:00'),
          reviewOf(1, '카카오', '백엔드', '2026-11-05T10:00:00'),
          reviewOf(2, '토스', '서버', '2026-11-01T10:00:00', { questions: ['격리 수준을 설명해보세요'] }),
        ],
        isLoading: false,
        isError: false,
      })
    })

    it('한 페이지에 2건씩 최신순으로 보여준다', () => {
      render(<Reviews />, { wrapper })

      expect(screen.getByText('카카오')).toBeInTheDocument()
      expect(screen.getByText('토스')).toBeInTheDocument()
      expect(screen.queryByText('네이버')).not.toBeInTheDocument()
    })

    it('다음 페이지로 이동하면 나머지 기록을 보여준다', async () => {
      render(<Reviews />, { wrapper })

      await userEvent.click(screen.getByRole('button', { name: '다음 페이지' }))

      expect(screen.getByText('네이버')).toBeInTheDocument()
      expect(screen.queryByText('카카오')).not.toBeInTheDocument()
    })

    it('기록이 2건 이하면 페이지 이동을 보여주지 않는다', () => {
      useReviews.mockReturnValue({ data: [reviewOf(1, '카카오', '백엔드', '2026-11-05T10:00:00')], isLoading: false, isError: false })
      render(<Reviews />, { wrapper })

      expect(screen.queryByRole('navigation', { name: '페이지 이동' })).not.toBeInTheDocument()
    })

    it('회사명으로 검색하면 맞는 기록만 보여준다', async () => {
      render(<Reviews />, { wrapper })

      await userEvent.type(screen.getByRole('searchbox', { name: '면접 기록 검색' }), '네이버')

      expect(screen.getByText('네이버')).toBeInTheDocument()
      expect(screen.queryByText('카카오')).not.toBeInTheDocument()
    })

    it('받은 질문으로도 검색할 수 있다', async () => {
      render(<Reviews />, { wrapper })

      await userEvent.type(screen.getByRole('searchbox', { name: '면접 기록 검색' }), '격리 수준')

      expect(screen.getByText('토스')).toBeInTheDocument()
      expect(screen.queryByText('카카오')).not.toBeInTheDocument()
    })

    it('2페이지를 보다가 검색하면 결과의 첫 페이지부터 보여준다', async () => {
      // 세 건 모두 검색어에 걸려서 결과가 계속 2페이지로 나뉜다.
      useReviews.mockReturnValue({
        data: [
          reviewOf(3, '네이버', '프론트엔드 개발자', '2026-10-20T10:00:00'),
          reviewOf(1, '카카오', '백엔드 개발자', '2026-11-05T10:00:00'),
          reviewOf(2, '토스', '서버 개발자', '2026-11-01T10:00:00'),
        ],
        isLoading: false,
        isError: false,
      })
      render(<Reviews />, { wrapper })
      await userEvent.click(screen.getByRole('button', { name: '다음 페이지' }))
      expect(screen.getByText('네이버')).toBeInTheDocument()

      await userEvent.type(screen.getByRole('searchbox', { name: '면접 기록 검색' }), '개발자')

      expect(screen.getByText('카카오')).toBeInTheDocument()
      expect(screen.queryByText('네이버')).not.toBeInTheDocument()
    })

    it('검색 결과가 없으면 안내한다', async () => {
      render(<Reviews />, { wrapper })

      await userEvent.type(screen.getByRole('searchbox', { name: '면접 기록 검색' }), '없는회사')

      expect(screen.getByText(/에 대한 검색 결과가 없습니다/)).toBeInTheDocument()
    })
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
