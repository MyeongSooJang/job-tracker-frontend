import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import StudyHeatmap from '../StudyHeatmap'

const TODAY = '2026-11-04'

function renderHeatmap(overrides: Partial<React.ComponentProps<typeof StudyHeatmap>> = {}) {
  const props = {
    today: TODAY,
    selectedDate: TODAY,
    days: [
      { date: '2026-11-04', count: 2, minutes: 90 },
      { date: '2026-11-03', count: 1, minutes: 0 },
      { date: '2026-11-02', count: 1, minutes: 200 },
    ],
    onSelect: vi.fn(),
    ...overrides,
  }
  render(<StudyHeatmap {...props} />)
  return props
}

describe('StudyHeatmap', () => {
  it('글이 있는 날은 날짜와 글 수와 공부 시간을 접근성 이름으로 알려준다', () => {
    renderHeatmap()

    expect(screen.getByRole('button', { name: '2026.11.04 (수) · 글 2개 · 1시간 30분' })).toBeInTheDocument()
  })

  it('글이 없는 날은 기록 없음이라고 알려준다', () => {
    renderHeatmap()

    expect(screen.getByRole('button', { name: '2026.11.01 (일) · 기록 없음' })).toBeInTheDocument()
  })

  it('오늘 이후 날짜는 칸으로 그리지 않는다', () => {
    renderHeatmap()

    expect(screen.queryByRole('button', { name: /2026\.11\.05/ })).not.toBeInTheDocument()
  })

  it('최근 1년의 날짜 칸을 모두 그린다', () => {
    renderHeatmap()

    // 52주 × 7일 + 마지막 주의 오늘까지 4일
    expect(screen.getAllByRole('button')).toHaveLength(52 * 7 + 4)
  })

  it('공부 시간에 따라 농도 단계가 다르고 글 없음과 0분 글을 구분한다', () => {
    renderHeatmap()

    expect(screen.getByRole('button', { name: /2026\.11\.01/ })).toHaveAttribute('data-level', '0')
    expect(screen.getByRole('button', { name: /2026\.11\.03/ })).toHaveAttribute('data-level', '1')
    expect(screen.getByRole('button', { name: /2026\.11\.04/ })).toHaveAttribute('data-level', '3')
    expect(screen.getByRole('button', { name: /2026\.11\.02/ })).toHaveAttribute('data-level', '4')
  })

  it('선택된 날짜는 눌린 상태로 표시된다', () => {
    renderHeatmap({ selectedDate: '2026-11-03' })

    expect(screen.getByRole('button', { name: /2026\.11\.03/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /2026\.11\.04/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('칸을 누르면 그 날짜를 선택한다', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderHeatmap()

    await user.click(screen.getByRole('button', { name: /2026\.11\.02/ }))

    expect(onSelect).toHaveBeenCalledWith('2026-11-02')
  })

  it('탭으로 들어갈 수 있는 칸은 한 칸뿐이다', () => {
    renderHeatmap()

    const tabStops = screen.getAllByRole('button').filter(button => button.tabIndex === 0)

    expect(tabStops).toHaveLength(1)
  })

  it('방향키로 일주일 전후와 하루 전후 칸으로 이동한다', async () => {
    const user = userEvent.setup()
    renderHeatmap()
    screen.getByRole('button', { name: /2026\.11\.04/ }).focus()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('button', { name: /2026\.10\.28/ })).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('button', { name: /2026\.10\.29/ })).toHaveFocus()

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('button', { name: /2026\.10\.28/ })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: /2026\.11\.04/ })).toHaveFocus()
  })

  it('오늘 이후나 범위 밖으로는 이동하지 않는다', async () => {
    const user = userEvent.setup()
    renderHeatmap()
    const today = screen.getByRole('button', { name: /2026\.11\.04/ })
    today.focus()

    await user.keyboard('{ArrowRight}')
    await user.keyboard('{ArrowDown}')

    expect(today).toHaveFocus()
  })
})
