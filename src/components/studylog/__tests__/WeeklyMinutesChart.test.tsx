import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WeeklyMinutesChart from '../WeeklyMinutesChart'

const week = [
  { date: '2026-10-28', minutes: 0 },
  { date: '2026-10-29', minutes: 30 },
  { date: '2026-10-30', minutes: 0 },
  { date: '2026-10-31', minutes: 60 },
  { date: '2026-11-01', minutes: 0 },
  { date: '2026-11-02', minutes: 120 },
  { date: '2026-11-03', minutes: 0 },
]

describe('WeeklyMinutesChart', () => {
  it('7일치 막대를 그리고 가장 많이 공부한 날이 가장 높다', () => {
    render(<WeeklyMinutesChart data={week} />)

    const heights = screen.getAllByTestId('chart-bar').map(bar => parseInt((bar as HTMLElement).style.height))

    expect(heights).toHaveLength(7)
    expect(Math.max(...heights)).toBe(heights[5])
    expect(heights[5]).toBeGreaterThan(heights[3])
    expect(heights[3]).toBeGreaterThan(heights[1])
  })

  it('공부하지 않은 날은 가장 낮은 기준선만 그린다', () => {
    render(<WeeklyMinutesChart data={week} />)

    const bars = screen.getAllByTestId('chart-bar') as HTMLElement[]

    expect(bars[0].style.height).toBe('2px')
  })

  it('합계를 제목에 보여주고 스크린리더용 표로 날짜별 값을 제공한다', () => {
    render(<WeeklyMinutesChart data={week} />)

    expect(screen.getByText('최근 7일 공부 시간 · 합계', { exact: false })).toHaveTextContent('3시간 30분')
    expect(screen.getByRole('table', { name: '최근 7일 공부 시간' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(8)
  })

  it('모두 0분이어도 오류 없이 그린다', () => {
    render(<WeeklyMinutesChart data={week.map(d => ({ ...d, minutes: 0 }))} />)

    expect(screen.getAllByTestId('chart-bar')).toHaveLength(7)
  })
})
