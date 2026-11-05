import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { HeatmapDay, StudyLog, StudyStats } from '@/api/types'
import StudyLogs from '../StudyLogs'

const stats: StudyStats = { currentStreak: 5, longestStreak: 21, monthWrittenDays: 9, todayMinutes: 90 }
const logs: StudyLog[] = [
  { id: 2, studyDate: '2026-11-04', title: 'JPA 정리', content: 'N+1', studyMinutes: 90 },
  { id: 1, studyDate: '2026-11-02', title: '알고리즘', content: '투 포인터', studyMinutes: 30 },
]
const heatmap: HeatmapDay[] = [
  { date: '2026-11-04', count: 1, minutes: 90 },
  { date: '2026-11-02', count: 1, minutes: 30 },
]
const fetchNextPage = vi.fn()
let feed: Record<string, unknown>

vi.mock('@/hooks/useStudyLogs', () => ({
  useStudyStats: () => ({ data: stats, isError: false }),
  useHeatmap: () => ({ data: heatmap, isError: false, isLoading: false }),
  useStudyLogFeed: () => feed,
}))

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

function renderPage() {
  render(
    <MemoryRouter>
      <StudyLogs />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('StudyLogs 페이지', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 4))
    feed = {
      data: { pages: [logs] },
      hasNextPage: true,
      isFetchingNextPage: false,
      isLoading: false,
      isError: false,
      fetchNextPage,
      refetch: vi.fn(),
    }
  })
  afterEach(() => vi.useRealTimers())

  it('통계 카드와 잔디와 날짜별 글 목록을 보여준다', () => {
    renderPage()

    expect(screen.getByText('21일')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '최근 1년 학습 잔디' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /11월 4일/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /알고리즘/ })).toBeInTheDocument()
  })

  it('오늘 기록 쓰기 버튼은 오늘 날짜로 새 글쓰기를 시작한다', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '오늘 기록 쓰기' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/study-logs/new?date=2026-11-04')
  })

  it('글을 누르면 그 글의 글쓰기 화면으로 이동한다', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /알고리즘/ }))

    expect(screen.getByTestId('location')).toHaveTextContent('/study-logs/1')
  })

  it('오늘 묶음의 새 글 버튼은 오늘 날짜로 새 글쓰기를 시작한다', async () => {
    const user = userEvent.setup()
    renderPage()

    const today = screen.getByRole('region', { name: /11월 4일/ })
    await user.click(within(today).getByRole('button', { name: '+ 이 날짜에 새 글' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/study-logs/new?date=2026-11-04')
  })

  it('달력에서 날짜를 고르면 그 날짜 묶음이 생기고 새 글을 시작할 수 있다', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '2026년 11월 3일' }))
    const day = screen.getByRole('region', { name: /11월 3일/ })
    await user.click(within(day).getByRole('button', { name: '+ 이 날짜에 새 글' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/study-logs/new?date=2026-11-03')
  })

  it('잔디 칸을 누르면 그 날짜가 선택된다', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /2026\.11\.01/ }))

    expect(screen.getByRole('region', { name: /11월 1일/ })).toBeInTheDocument()
  })

  it('이전 기록 더 보기를 누르면 다음 구간을 불러온다', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '이전 기록 더 보기' }))

    expect(fetchNextPage).toHaveBeenCalled()
  })

  it('고른 날짜가 아직 불러오지 않은 오래된 구간이면 거기까지 이어서 불러온다', async () => {
    const user = userEvent.setup()
    renderPage()
    fetchNextPage.mockClear()

    await user.click(screen.getByRole('button', { name: /2025\.12\.01/ }))

    expect(fetchNextPage).toHaveBeenCalled()
  })

  it('다음 구간을 불러오다 실패한 뒤에는 오래된 날짜를 골라도 자동으로 다시 불러오지 않는다', async () => {
    const user = userEvent.setup()
    feed = { ...feed, isFetchNextPageError: true }
    renderPage()
    fetchNextPage.mockClear()

    await user.click(screen.getByRole('button', { name: /2025\.12\.01/ }))

    expect(fetchNextPage).not.toHaveBeenCalled()
  })
})
