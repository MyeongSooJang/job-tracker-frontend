import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import StudyTimeChart from '../StudyTimeChart'

// 2026-11-10은 화요일이라 이번 주는 11월 8일(일요일)에 시작한다.
const TODAY = '2026-11-10'
const days = [
  { date: '2026-11-10', minutes: 90 }, // 이번 주
  { date: '2026-11-03', minutes: 120 }, // 11월 1일 주
  { date: '2026-10-20', minutes: 30 }, // 10월 18일 주
  { date: '2026-09-15', minutes: 200 }, // 9월 13일 주 (가장 큰 주)
]

const bars = (container: HTMLElement) => container.querySelectorAll('[data-part="bar"]')
const valueLabels = (container: HTMLElement) => container.querySelectorAll('[data-part="value-label"]')

describe('StudyTimeChart', () => {
  it('기본은 주별이고 최근 12주와 이번 주 공부 시간을 보여준다', () => {
    render(<StudyTimeChart today={TODAY} days={days} />)

    expect(screen.getByRole('heading', { name: '공부 시간' })).toBeInTheDocument()
    expect(screen.getByText('최근 12주')).toBeInTheDocument()
    expect(screen.getByText('이번 주')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '주별' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '월별' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getAllByRole('listitem')).toHaveLength(12)
  })

  it('막대마다 기간과 공부 시간을 접근 가능한 이름으로 가지고 이번 주만 진행 중이다', () => {
    render(<StudyTimeChart today={TODAY} days={days} />)

    expect(screen.getByRole('listitem', { name: '11월 8일 주, 1시간 30분, 진행 중' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: '9월 13일 주, 3시간 20분' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem', { name: /진행 중/ })).toHaveLength(1)
  })

  it('막대 높이가 맨 위 눈금에 대한 비율이고 글이 없는 주는 0이다', () => {
    const { container } = render(<StudyTimeChart today={TODAY} days={days} />)

    // 최댓값 200분이면 눈금 단위 60분, 맨 위 240분이다.
    const heights = Array.from(bars(container)).map(bar => parseFloat((bar as HTMLElement).style.height))
    expect(Math.max(...heights)).toBeCloseTo((200 / 240) * 100, 1)
    expect(heights.filter(height => height === 0).length).toBeGreaterThan(0)
  })

  it('수치 글자는 가장 큰 주와 진행 중인 주에만 붙는다', () => {
    const { container } = render(<StudyTimeChart today={TODAY} days={days} />)

    expect(valueLabels(container)).toHaveLength(2)
  })

  it('월별을 누르면 최근 12개월로 바뀐다', async () => {
    const user = userEvent.setup()
    render(<StudyTimeChart today={TODAY} days={days} />)

    await user.click(screen.getByRole('button', { name: '월별' }))

    expect(screen.getByText('최근 12개월')).toBeInTheDocument()
    expect(screen.getByText('이번 달')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '월별' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByRole('listitem')).toHaveLength(12)
    expect(screen.getByRole('listitem', { name: '2026년 11월, 3시간 30분, 진행 중' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: '2026년 9월, 3시간 20분' })).toBeInTheDocument()
  })

  it('막대에 마우스를 올리면 툴팁이 뜨고 벗어나면 사라진다', () => {
    render(<StudyTimeChart today={TODAY} days={days} />)
    const item = screen.getByRole('listitem', { name: '10월 18일 주, 30분' })

    expect(screen.queryByText('10월 18일 주')).not.toBeInTheDocument()

    fireEvent.pointerEnter(item)
    expect(within(item).getByText('30분')).toBeInTheDocument()
    expect(within(item).getByText('10월 18일 주')).toBeInTheDocument()

    fireEvent.pointerLeave(item)
    expect(screen.queryByText('10월 18일 주')).not.toBeInTheDocument()
  })

  it('키보드로 포커스해도 같은 툴팁이 뜬다', () => {
    render(<StudyTimeChart today={TODAY} days={days} />)
    const item = screen.getByRole('listitem', { name: '10월 18일 주, 30분' })

    fireEvent.focus(item)
    expect(within(item).getByText('10월 18일 주')).toBeInTheDocument()

    fireEvent.blur(item)
    expect(screen.queryByText('10월 18일 주')).not.toBeInTheDocument()
  })

  it('표로 보기를 누르면 같은 값을 표로 보여주고 차트로 돌아올 수 있다', async () => {
    const user = userEvent.setup()
    render(<StudyTimeChart today={TODAY} days={days} />)

    await user.click(screen.getByRole('button', { name: '표로 보기' }))

    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(13)
    expect(within(table).getByRole('row', { name: /11월 8일 주 \(진행 중\)/ })).toHaveTextContent('1시간 30분')
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '차트로 보기' }))

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(12)
  })

  it('기록이 하나도 없으면 막대 대신 안내 문구를 보여준다', () => {
    render(<StudyTimeChart today={TODAY} days={[]} />)

    expect(screen.getByText('아직 기록한 시간이 없어요. 오늘 글을 쓰면 여기에 쌓여요.')).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '표로 보기' })).not.toBeInTheDocument()
  })
})
