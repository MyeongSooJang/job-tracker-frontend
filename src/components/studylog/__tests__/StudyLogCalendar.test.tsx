import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import StudyLogCalendar from '../StudyLogCalendar'

const TODAY = '2026-11-03'

function renderCalendar(overrides: Partial<React.ComponentProps<typeof StudyLogCalendar>> = {}) {
  const props = {
    month: '2026-11',
    today: TODAY,
    selectedDate: TODAY,
    writtenDates: new Set(['2026-11-01']),
    onMonthChange: vi.fn(),
    onSelect: vi.fn(),
    ...overrides,
  }
  render(<StudyLogCalendar {...props} />)
  return props
}

describe('StudyLogCalendar', () => {
  it('기록이 있는 날은 접근성 이름에 기록 있음이 붙는다', () => {
    renderCalendar()

    expect(screen.getByRole('button', { name: '2026년 11월 1일 기록 있음' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2026년 11월 2일' })).toBeInTheDocument()
  })

  it('선택된 날짜는 눌린 상태로 표시된다', () => {
    renderCalendar({ selectedDate: '2026-11-02' })

    expect(screen.getByRole('button', { name: '2026년 11월 2일' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '2026년 11월 3일 (오늘)' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('오늘 이후 날짜는 선택할 수 없다', () => {
    renderCalendar()

    expect(screen.getByRole('button', { name: '2026년 11월 4일' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '2026년 11월 3일 (오늘)' })).toBeEnabled()
  })

  it('날짜를 누르면 그 날짜를 선택한다', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderCalendar()

    await user.click(screen.getByRole('button', { name: '2026년 11월 1일 기록 있음' }))

    expect(onSelect).toHaveBeenCalledWith('2026-11-01')
  })

  it('이전 달과 다음 달 버튼으로 달을 바꾼다', async () => {
    const user = userEvent.setup()
    const { onMonthChange } = renderCalendar({ month: '2026-10' })

    await user.click(screen.getByRole('button', { name: '이전 달' }))
    await user.click(screen.getByRole('button', { name: '다음 달' }))

    expect(onMonthChange).toHaveBeenNthCalledWith(1, '2026-09')
    expect(onMonthChange).toHaveBeenNthCalledWith(2, '2026-11')
  })

  it('이번 달에서는 다음 달로 넘어갈 수 없다', () => {
    renderCalendar()

    expect(screen.getByRole('button', { name: '다음 달' })).toBeDisabled()
  })
})
