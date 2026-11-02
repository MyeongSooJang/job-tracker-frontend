import type { Schedule } from '@/api/types'

const DAY_MS = 24 * 60 * 60 * 1000

// 지금부터 withinDays일 이내에 잡힌 면접만 가까운 순으로 돌려준다. 이미 지난 면접은 제외한다.
export function upcomingInterviews(schedules: Schedule[], now: Date, withinDays: number): Schedule[] {
  const from = now.getTime()
  const until = from + withinDays * DAY_MS
  return schedules
    .filter(s => s.type === 'INTERVIEW')
    .filter(s => {
      const at = new Date(s.scheduledAt).getTime()
      return at >= from && at <= until
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
}
