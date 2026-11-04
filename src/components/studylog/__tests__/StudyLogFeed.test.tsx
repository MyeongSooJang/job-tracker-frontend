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
})
