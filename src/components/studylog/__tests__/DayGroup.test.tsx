import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import type { StudyLog } from '@/api/types'
import type { StudyDay } from '@/lib/studyLog'
import DayGroup from '../DayGroup'

const TODAY = '2026-11-04'
const day: StudyDay<StudyLog> = {
  date: TODAY,
  logs: [
    { id: 2, studyDate: TODAY, title: '알고리즘', content: '## 투 포인터', studyMinutes: 80 },
    { id: 1, studyDate: TODAY, title: 'JPA 정리', content: 'N+1 문제', studyMinutes: 120 },
  ],
  totalMinutes: 200,
}

function renderGroup(overrides: Partial<React.ComponentProps<typeof DayGroup>> = {}) {
  const props = { day, today: TODAY, selected: false, onOpen: vi.fn(), onWrite: vi.fn(), ...overrides }
  render(<DayGroup {...props} />)
  return props
}

describe('DayGroup', () => {
  it('날짜 머리글에 글 개수와 공부 시간 합계를 보여준다', () => {
    renderGroup()

    expect(screen.getByRole('heading', { name: /11월 4일 수요일/ })).toBeInTheDocument()
    expect(screen.getByText('글 2개 · 3시간 20분')).toBeInTheDocument()
  })

  it('오늘 날짜에는 오늘 표시를 붙인다', () => {
    renderGroup()

    expect(screen.getByText('오늘')).toBeInTheDocument()
  })

  it('글마다 제목과 본문 요약과 공부 시간을 보여준다', () => {
    renderGroup()

    const entry = screen.getByRole('button', { name: /JPA 정리/ })
    expect(entry).toHaveTextContent('N+1 문제')
    expect(entry).toHaveTextContent('2시간')
  })

  it('글을 누르면 그 글의 id로 연다', async () => {
    const user = userEvent.setup()
    const { onOpen } = renderGroup()

    await user.click(screen.getByRole('button', { name: /알고리즘/ }))

    expect(onOpen).toHaveBeenCalledWith(2)
  })

  it('오늘이면 이 날짜에 새 글 버튼이 있고 누르면 그 날짜로 쓰기를 시작한다', async () => {
    const user = userEvent.setup()
    const { onWrite } = renderGroup()

    await user.click(screen.getByRole('button', { name: '+ 이 날짜에 새 글' }))

    expect(onWrite).toHaveBeenCalledWith(TODAY)
  })

  it('오늘도 선택한 날도 아니면 새 글 버튼이 없다', () => {
    renderGroup({ day: { ...day, date: '2026-11-02' }, today: TODAY, selected: false })

    expect(screen.queryByRole('button', { name: '+ 이 날짜에 새 글' })).not.toBeInTheDocument()
  })

  it('선택한 날이면 오늘이 아니어도 새 글 버튼이 있다', () => {
    renderGroup({ day: { ...day, date: '2026-11-02' }, selected: true })

    expect(screen.getByRole('button', { name: '+ 이 날짜에 새 글' })).toBeInTheDocument()
  })

  it('글이 없는 날은 기록 없음이라고 알려준다', () => {
    renderGroup({ day: { date: TODAY, logs: [], totalMinutes: 0 } })

    expect(screen.getByText('기록 없음')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
