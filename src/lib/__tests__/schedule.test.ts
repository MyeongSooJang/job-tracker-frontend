import { describe, it, expect } from 'vitest'
import { upcomingInterviews, upcomingSchedules } from '../schedule'
import type { Schedule } from '@/api/types'

const now = new Date('2026-11-02T00:00:00')

function schedule(id: number, scheduledAt: string, type: Schedule['type'] = 'INTERVIEW'): Schedule {
  return { id, scheduledAt, type } as Schedule
}

describe('upcomingInterviews', () => {
  it('10일 이내의 면접만 가까운 순으로 반환한다', () => {
    const result = upcomingInterviews(
      [schedule(1, '2026-11-09T10:00:00'), schedule(2, '2026-11-03T10:00:00')],
      now,
      10,
    )
    expect(result.map(s => s.id)).toEqual([2, 1])
  })

  it('지난 면접은 제외한다', () => {
    expect(upcomingInterviews([schedule(1, '2026-11-01T10:00:00')], now, 10)).toEqual([])
  })

  it('10일을 넘는 면접은 제외한다', () => {
    expect(upcomingInterviews([schedule(1, '2026-11-13T10:00:00')], now, 10)).toEqual([])
  })

  it('면접이 아닌 일정은 제외한다', () => {
    expect(upcomingInterviews([schedule(1, '2026-11-03T10:00:00', 'TASK')], now, 10)).toEqual([])
  })
})

describe('upcomingSchedules', () => {
  it('지난 일정은 제외하고 유형과 무관하게 가까운 순으로 반환한다', () => {
    const result = upcomingSchedules(
      [
        schedule(1, '2026-12-01T10:00:00', 'TASK'),
        schedule(2, '2026-10-30T10:00:00'),
        schedule(3, '2026-11-03T10:00:00'),
      ],
      now,
    )
    expect(result.map(s => s.id)).toEqual([3, 1])
  })
})
