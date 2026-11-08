import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import type { StudyLog } from '@/api/types'
import StudyLogFeed from '../StudyLogFeed'

const TODAY = '2026-11-04'
const log = (id: number, studyDate: string): StudyLog => ({ id, studyDate, title: `글${id}`, content: '내용', studyMinutes: 30 })

function renderFeed(overrides: Partial<React.ComponentProps<typeof StudyLogFeed>> = {}) {
  const props = {
    logs: [log(2, '2026-11-04'), log(1, '2026-11-02')],
    today: TODAY,
    selectedDate: TODAY,
    weekday: null,
    onlyDate: null,
    onShowAll: vi.fn(),
    isLoading: false,
    isError: false,
    hasMore: true,
    isFetchingMore: false,
    onRetry: vi.fn(),
    onLoadMore: vi.fn(),
    onOpen: vi.fn(),
    onWrite: vi.fn(),
    ...overrides,
  }
  render(<StudyLogFeed {...props} />)
  return props
}

describe('StudyLogFeed', () => {
  it('글을 날짜별로 묶어 최신 날짜부터 보여준다', () => {
    renderFeed()

    const headings = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)
    expect(headings[0]).toContain('11월 4일')
    expect(headings[1]).toContain('11월 2일')
  })

  it('오늘 글이 없어도 오늘 묶음과 새 글 버튼을 보여준다', () => {
    renderFeed({ logs: [log(1, '2026-11-02')] })

    const todaySection = screen.getByRole('region', { name: /11월 4일/ })
    expect(within(todaySection).getByText('기록 없음')).toBeInTheDocument()
    expect(within(todaySection).getByRole('button', { name: '+ 이 날짜에 새 글' })).toBeInTheDocument()
  })

  it('고른 날짜에 글이 없어도 그 날짜 묶음을 끼워 넣는다', () => {
    renderFeed({ selectedDate: '2026-11-03' })

    expect(screen.getByRole('region', { name: /11월 3일/ })).toBeInTheDocument()
  })

  it('기록이 하나도 없으면 첫 글을 안내한다', () => {
    renderFeed({ logs: [] })

    expect(screen.getByText(/첫 글을 남겨보세요/)).toBeInTheDocument()
  })

  it('불러오는 중에는 목록 대신 불러오는 중 표시를 보여준다', () => {
    renderFeed({ isLoading: true })

    expect(screen.getByLabelText('기록 불러오는 중')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('불러오지 못하면 알리고 다시 시도할 수 있다', async () => {
    const user = userEvent.setup()
    const { onRetry } = renderFeed({ isError: true })

    expect(screen.getByRole('alert')).toHaveTextContent('기록을 불러오지 못했습니다')
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(onRetry).toHaveBeenCalled()
  })

  it('이전 기록 더 보기를 누르면 더 불러온다', async () => {
    const user = userEvent.setup()
    const { onLoadMore } = renderFeed()

    await user.click(screen.getByRole('button', { name: '이전 기록 더 보기' }))

    expect(onLoadMore).toHaveBeenCalled()
  })

  it('더 불러오는 중에는 버튼을 비활성화한다', () => {
    renderFeed({ isFetchingMore: true })

    expect(screen.getByRole('button', { name: '불러오는 중...' })).toBeDisabled()
  })

  it('더 불러올 기록이 없으면 버튼 대신 안내한다', () => {
    renderFeed({ hasMore: false })

    expect(screen.queryByRole('button', { name: '이전 기록 더 보기' })).not.toBeInTheDocument()
    expect(screen.getByText('최근 1년 기록을 모두 불러왔어요.')).toBeInTheDocument()
  })

  describe('요일로 거르기', () => {
    // 2026-11-02, 11-09, 11-16, 11-23, 11-30 은 월요일, 11-03 은 화요일
    const mondays = ['2026-11-30', '2026-11-23', '2026-11-16', '2026-11-09', '2026-11-02']
    const logs = [...mondays.map((d, i) => log(10 + i, d)), log(1, '2026-11-03')]

    it('그 요일의 날짜만 최대 3일까지 보여준다', () => {
      renderFeed({ logs, weekday: 1, today: '2026-11-30', selectedDate: '2026-11-30' })

      const headings = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)
      expect(headings).toHaveLength(3)
      expect(headings.every(h => h?.includes('월요일'))).toBe(true)
    })

    it('더 보기를 누르면 3일씩 더 펼친다', async () => {
      renderFeed({ logs, weekday: 1, today: '2026-11-30', selectedDate: '2026-11-30' })

      await userEvent.click(screen.getByRole('button', { name: /더 보기 \(2일 더\)/ }))

      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
      expect(screen.queryByRole('button', { name: /^더 보기/ })).not.toBeInTheDocument()
    })

    it('그 요일에 쓴 글이 없으면 안내한다', () => {
      renderFeed({ logs: [log(1, '2026-11-03')], weekday: 1 })

      expect(screen.getByText(/월요일에 쓴 글이 없어요/)).toBeInTheDocument()
    })
  })

  describe('날짜로 거르기', () => {
    it('고른 날짜의 글만 보여주고 전체 기록 보기로 되돌린다', async () => {
      const { onShowAll } = renderFeed({ onlyDate: '2026-11-02' })

      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings).toHaveLength(1)
      expect(headings[0]).toHaveTextContent('11월 2일')
      expect(screen.queryByRole('button', { name: '이전 기록 더 보기' })).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: '전체 기록 보기' }))
      expect(onShowAll).toHaveBeenCalled()
    })

    it('고른 날짜에 글이 없어도 그 날짜 묶음과 새 글 버튼을 보여준다', () => {
      renderFeed({ onlyDate: '2026-11-03', selectedDate: '2026-11-03' })

      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
      expect(screen.getByRole('button', { name: '+ 이 날짜에 새 글' })).toBeInTheDocument()
    })
  })
})
