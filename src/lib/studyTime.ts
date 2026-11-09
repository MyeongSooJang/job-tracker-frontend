import { addDays, shiftMonth, toMonthKey, weekdayIndex } from '@/lib/studyLog'

export interface DayMinutes {
  date: string
  minutes: number
}

export interface TimeBucket {
  key: string
  label: string
  tooltipLabel: string
  minutes: number
  inProgress: boolean
}

export type TimeRange = 'week' | 'month'

const weekStart = (date: string) => addDays(date, -weekdayIndex(date))

// 날짜(yyyy-MM-dd)를 [월, 일] 숫자로 푼다.
const monthDay = (date: string): [number, number] => {
  const [, month, day] = date.split('-').map(Number)
  return [month, day]
}

// 일요일 시작 주 count개. 오늘이 속한 주가 마지막이고 오늘 이후 날짜는 합치지 않는다.
export function weeklyBuckets(days: readonly DayMinutes[], today: string, count = 12): TimeBucket[] {
  const currentStart = weekStart(today)
  const totals = new Map<string, number>()
  for (const { date, minutes } of days) {
    if (date > today) continue
    const start = weekStart(date)
    totals.set(start, (totals.get(start) ?? 0) + minutes)
  }
  return Array.from({ length: count }, (_, i) => {
    const start = addDays(currentStart, -7 * (count - 1 - i))
    const [month, day] = monthDay(start)
    return {
      key: start,
      label: `${month}/${day}`,
      tooltipLabel: `${month}월 ${day}일 주`,
      minutes: totals.get(start) ?? 0,
      inProgress: start === currentStart,
    }
  })
}

// 달 count개. 이번 달이 마지막이고 오늘 이후 날짜는 합치지 않는다.
export function monthlyBuckets(days: readonly DayMinutes[], today: string, count = 12): TimeBucket[] {
  const currentMonth = toMonthKey(today)
  const totals = new Map<string, number>()
  for (const { date, minutes } of days) {
    if (date > today) continue
    const month = toMonthKey(date)
    totals.set(month, (totals.get(month) ?? 0) + minutes)
  }
  return Array.from({ length: count }, (_, i) => {
    const key = shiftMonth(currentMonth, -(count - 1 - i))
    const [year, month] = key.split('-').map(Number)
    return {
      key,
      label: `${month}월`,
      tooltipLabel: `${year}년 ${month}월`,
      minutes: totals.get(key) ?? 0,
      inProgress: key === currentMonth,
    }
  })
}

export interface AxisScale {
  top: number
  step: number
  ticks: number[]
}

// 눈금 단위(분). 눈금 간격이 MAX_INTERVALS 이하가 되는 가장 작은 단위를 고른다.
const AXIS_STEPS = [15, 30, 60, 120, 300, 600, 1200, 3000, 6000] as const
const MAX_INTERVALS = 4

export function niceAxis(maxMinutes: number): AxisScale {
  const max = Math.max(0, maxMinutes)
  const largest = AXIS_STEPS[AXIS_STEPS.length - 1]
  const step =
    AXIS_STEPS.find(candidate => Math.ceil(max / candidate) <= MAX_INTERVALS) ??
    Math.ceil(max / MAX_INTERVALS / largest) * largest
  const intervals = Math.max(1, Math.ceil(max / step))
  return {
    top: intervals * step,
    step,
    ticks: Array.from({ length: intervals + 1 }, (_, i) => i * step),
  }
}
