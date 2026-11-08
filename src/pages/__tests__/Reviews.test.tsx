import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Reviews from '../Reviews'

const useReviews = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useReviews', () => ({
  useReviews: () => useReviews(),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

// id가 클수록 최신이다. 회사명은 "회사{id}", 직무는 "직무{id}".
const reviewOf = (id: number, extra = {}) => ({
  id,
  application: {
    id: id + 100,
    company: { id, name: `회사${id}`, industry: 'IT', website: '', createdAt: '' },
    position: `직무${id}`,
    status: 'INTERVIEW',
    appliedDate: '2026-10-01',
    createdAt: '',
  },
  content: null,
  rating: null,
  createdAt: `2026-10-${String(id).padStart(2, '0')}T10:00:00`,
  updatedAt: `2026-10-${String(id).padStart(2, '0')}T10:00:00`,
  ...extra,
})

const written = (id: number, extra = {}) => reviewOf(id, { content: `후기 ${id}`, rating: 4, ...extra })

const mockReviews = (data: unknown[]) =>
  useReviews.mockReturnValue({ data, isLoading: false, isError: false })

const search = (text: string) =>
  userEvent.type(screen.getByRole('searchbox', { name: '면접 기록 검색' }), text)

beforeEach(() => {
  mockReviews([reviewOf(1)])
})

describe('Reviews', () => {
  it('내 면접 기록 화면이다', () => {
    render(<Reviews />, { wrapper })

    expect(screen.getByRole('heading', { name: '내 면접 기록' })).toBeInTheDocument()
  })

  it('기록이 없으면 안내한다', () => {
    mockReviews([])
    render(<Reviews />, { wrapper })

    expect(screen.getByText(/아직 면접 기록이 없습니다/)).toBeInTheDocument()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  describe('기록 행', () => {
    it('회사, 직무, 전형 단계를 보여주고 지원 상세로 연결한다', () => {
      render(<Reviews />, { wrapper })

      const row = screen.getByRole('link', { name: /회사1/ })
      expect(row).toHaveAttribute('href', '/applications/101')
      expect(row).toHaveTextContent('직무1')
      expect(row).toHaveTextContent('면접 진행')
    })

    it('작성 전인 기록은 작성 전이라고 알려 준다', () => {
      render(<Reviews />, { wrapper })

      expect(screen.getByText('작성 전')).toBeInTheDocument()
      expect(screen.queryByRole('img', { name: /별점/ })).not.toBeInTheDocument()
    })

    it('작성한 기록은 별점과 면접 상세를 요약해서 보여준다', () => {
      mockReviews([written(1, { difficulty: 4, atmosphere: 'TENSE' })])
      render(<Reviews />, { wrapper })

      expect(screen.queryByText('작성 전')).not.toBeInTheDocument()
      expect(screen.getByRole('img', { name: '별점 4.0점' })).toBeInTheDocument()
      expect(screen.getByRole('img', { name: '난이도 4/5 어려움' })).toBeInTheDocument()
      expect(screen.getByText('분위기 경직')).toBeInTheDocument()
    })

    it('작성한 기록의 본문은 목록에 펼쳐 보이지 않는다', () => {
      mockReviews([written(1)])
      render(<Reviews />, { wrapper })

      expect(screen.queryByText('후기 1')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  describe('여러 건일 때', () => {
    // 9건이라 2페이지로 나뉜다. 최신순이므로 1페이지는 회사9~회사2, 2페이지는 회사1.
    beforeEach(() => {
      mockReviews(Array.from({ length: 9 }, (_, i) => reviewOf(i + 1, i % 2 === 0 ? {} : { content: '후기', rating: 3 })))
    })

    it('한 페이지에 8건씩 최신순으로 보여준다', () => {
      render(<Reviews />, { wrapper })

      expect(screen.getAllByRole('link')).toHaveLength(8)
      expect(screen.getByText('회사9')).toBeInTheDocument()
      expect(screen.queryByText('회사1')).not.toBeInTheDocument()
    })

    it('다음 페이지로 이동하면 나머지 기록을 보여준다', async () => {
      render(<Reviews />, { wrapper })

      await userEvent.click(screen.getByRole('button', { name: '다음 페이지' }))

      expect(screen.getByText('회사1')).toBeInTheDocument()
      expect(screen.queryByText('회사9')).not.toBeInTheDocument()
    })

    it('기록이 8건 이하면 페이지 이동을 보여주지 않는다', () => {
      mockReviews([reviewOf(1), reviewOf(2)])
      render(<Reviews />, { wrapper })

      expect(screen.queryByRole('navigation', { name: '페이지 이동' })).not.toBeInTheDocument()
    })

    it('2페이지를 보다가 검색하면 결과의 첫 페이지부터 보여준다', async () => {
      render(<Reviews />, { wrapper })
      await userEvent.click(screen.getByRole('button', { name: '다음 페이지' }))
      expect(screen.getByText('회사1')).toBeInTheDocument()

      await search('회사')

      expect(screen.getByText('회사9')).toBeInTheDocument()
      expect(screen.queryByText('회사1')).not.toBeInTheDocument()
    })
  })

  describe('검색', () => {
    beforeEach(() => {
      mockReviews([
        written(3, { content: '분위기가 좋았다' }),
        reviewOf(2, { questions: ['격리 수준을 설명해보세요'] }),
        reviewOf(1),
      ])
    })

    it('회사명으로 검색하면 맞는 기록만 보여준다', async () => {
      render(<Reviews />, { wrapper })

      await search('회사1')

      expect(screen.getByText('회사1')).toBeInTheDocument()
      expect(screen.queryByText('회사2')).not.toBeInTheDocument()
    })

    it('받은 질문으로도 검색할 수 있다', async () => {
      render(<Reviews />, { wrapper })

      await search('격리 수준')

      expect(screen.getByText('회사2')).toBeInTheDocument()
      expect(screen.queryByText('회사3')).not.toBeInTheDocument()
    })

    it('후기 본문으로도 검색할 수 있다', async () => {
      render(<Reviews />, { wrapper })

      await search('분위기')

      expect(screen.getByText('회사3')).toBeInTheDocument()
      expect(screen.queryByText('회사1')).not.toBeInTheDocument()
    })

    it('검색 결과가 없으면 안내한다', async () => {
      render(<Reviews />, { wrapper })

      await search('없는회사')

      expect(screen.getByText(/에 대한 검색 결과가 없습니다/)).toBeInTheDocument()
    })
  })

  describe('작성 전 필터', () => {
    beforeEach(() => {
      mockReviews([written(3), reviewOf(2), reviewOf(1)])
    })

    it('작성 전인 기록의 개수를 필터에 보여준다', () => {
      render(<Reviews />, { wrapper })

      expect(screen.getByRole('button', { name: '작성 전 2' })).toBeInTheDocument()
    })

    it('작성 전만 보면 쓰지 않은 기록만 남는다', async () => {
      render(<Reviews />, { wrapper })

      await userEvent.click(screen.getByRole('button', { name: '작성 전 2' }))

      expect(screen.queryByText('회사3')).not.toBeInTheDocument()
      expect(screen.getByText('회사2')).toBeInTheDocument()
      expect(screen.getByText('회사1')).toBeInTheDocument()
    })

    it('작성 전 필터에서도 검색할 수 있다', async () => {
      render(<Reviews />, { wrapper })
      await userEvent.click(screen.getByRole('button', { name: '작성 전 2' }))

      await search('회사2')

      expect(screen.getByText('회사2')).toBeInTheDocument()
      expect(screen.queryByText('회사1')).not.toBeInTheDocument()
    })

    it('2페이지를 보다가 필터를 바꾸면 결과의 첫 페이지부터 보여준다', async () => {
      // 열 건이 모두 작성 전이라 필터를 켜도 결과가 2페이지로 나뉜다.
      mockReviews(Array.from({ length: 10 }, (_, i) => reviewOf(i + 1)))
      render(<Reviews />, { wrapper })
      await userEvent.click(screen.getByRole('button', { name: '다음 페이지' }))
      expect(screen.getByText('회사1')).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: '작성 전 10' }))

      expect(screen.getByText('회사10')).toBeInTheDocument()
      expect(screen.queryByText('회사1')).not.toBeInTheDocument()
    })

    it('작성 전인 기록이 없으면 다 썼다고 안내한다', async () => {
      mockReviews([written(1), written(2)])
      render(<Reviews />, { wrapper })

      await userEvent.click(screen.getByRole('button', { name: '작성 전 0' }))

      expect(screen.getByText(/작성 전인 기록이 없습니다/)).toBeInTheDocument()
    })

    it('전체를 누르면 필터가 풀린다', async () => {
      render(<Reviews />, { wrapper })
      await userEvent.click(screen.getByRole('button', { name: '작성 전 2' }))

      await userEvent.click(screen.getByRole('button', { name: '전체 3' }))

      expect(screen.getByText('회사3')).toBeInTheDocument()
    })
  })
})
