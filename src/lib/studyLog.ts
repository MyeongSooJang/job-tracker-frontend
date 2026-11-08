const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const pad = (n: number) => String(n).padStart(2, '0')

// 브라우저 로컬 날짜(한국 사용자 기준 KST)를 yyyy-MM-dd로 만든다.
export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const toMonthKey = (dateKey: string) => dateKey.slice(0, 7)

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const shifted = new Date(year, month - 1 + delta, 1)
  return `${shifted.getFullYear()}-${pad(shifted.getMonth() + 1)}`
}

// 일요일 시작 달력 칸. 1일 앞은 요일만큼, 말일 뒤는 7의 배수가 되도록 null로 채운다.
export function buildMonthCells(monthKey: string): Array<string | null> {
  const [year, month] = monthKey.split('-').map(Number)
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: Array<string | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${monthKey}-${pad(i + 1)}`),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}분`
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`
}

// 0(일)~6(토)
export function weekdayIndex(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day).getDay()
}

export function weekdayLabel(dateKey: string): string {
  return WEEKDAYS[weekdayIndex(dateKey)]
}

export function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return `${year}.${pad(month)}.${pad(day)} (${weekdayLabel(dateKey)})`
}

// 글 목록용 한 줄 요약. 첫 비어 있지 않은 줄에서 제목·목록·인용 기호를 뗀다.
export function summarize(content: string, maxLength = 40): string {
  const firstLine = content.split('\n').map(line => line.trim()).find(line => line.length > 0) ?? ''
  const plain = firstLine.replace(/^(#{1,6}|[-*+>]|\d+\.)\s*/, '')
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain
}

export function addDays(dateKey: string, delta: number): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return toDateKey(new Date(year, month - 1, day + delta))
}

export function monthRange(monthKey: string): { from: string; to: string } {
  const [year, month] = monthKey.split('-').map(Number)
  return { from: `${monthKey}-01`, to: toDateKey(new Date(year, month, 0)) }
}

export function formatDayHeading(dateKey: string): string {
  const [, month, day] = dateKey.split('-').map(Number)
  return `${month}월 ${day}일 ${weekdayLabel(dateKey)}요일`
}

// 주소의 date 파라미터가 없거나 틀렸거나 미래이면 오늘을 쓴다(미래 날짜에는 기록할 수 없다).
export function resolveWriteDate(param: string | null, today: string): string {
  if (param === null || !/^\d{4}-\d{2}-\d{2}$/.test(param)) return today
  const [year, month, day] = param.split('-').map(Number)
  const isRealDate = toDateKey(new Date(year, month - 1, day)) === param
  return isRealDate && param <= today ? param : today
}

export type HeatLevel = 0 | 1 | 2 | 3 | 4

// 글이 없는 날(0)과 글은 썼지만 0분인 날(1)을 구분한다.
export function heatLevel(count: number, minutes: number): HeatLevel {
  if (count === 0) return 0
  if (minutes >= 180) return 4
  if (minutes >= 90) return 3
  if (minutes >= 30) return 2
  return 1
}

export const HEATMAP_WEEKS = 53

// 일요일 시작 주를 열로 하는 격자. 마지막 열이 오늘이 속한 주이고 오늘 이후 칸은 null 이다.
export function buildHeatmapWeeks(today: string): Array<Array<string | null>> {
  const [year, month, day] = today.split('-').map(Number)
  const weekday = new Date(year, month - 1, day).getDay()
  const firstWeekStart = addDays(today, -weekday - 7 * (HEATMAP_WEEKS - 1))
  return Array.from({ length: HEATMAP_WEEKS }, (_, week) =>
    Array.from({ length: 7 }, (_, dayOfWeek) => {
      const date = addDays(firstWeekStart, week * 7 + dayOfWeek)
      return date > today ? null : date
    }),
  )
}

export function heatmapRange(today: string): { from: string; to: string } {
  return { from: buildHeatmapWeeks(today)[0][0] as string, to: today }
}

// 월이 바뀌는 열마다 라벨을 붙인다. 첫 라벨이 다음 라벨과 3열 안으로 붙으면 겹치므로 뺀다.
export function heatmapMonthLabels(weeks: Array<Array<string | null>>): Array<{ week: number; label: string }> {
  const labels: Array<{ week: number; label: string }> = []
  let previousMonth = -1
  weeks.forEach((week, index) => {
    const first = week.find((date): date is string => date !== null)
    if (!first) return
    const month = Number(first.slice(5, 7))
    if (month !== previousMonth) {
      labels.push({ week: index, label: `${month}월` })
      previousMonth = month
    }
  })
  return labels.length > 1 && labels[1].week - labels[0].week < 3 ? labels.slice(1) : labels
}

export function heatmapCellLabel(date: string, day: { count: number; minutes: number } | undefined): string {
  const head = formatDateLabel(date)
  return day ? `${head} · 글 ${day.count}개 · ${formatMinutes(day.minutes)}` : `${head} · 기록 없음`
}

interface DatedLog {
  studyDate: string
  studyMinutes: number
}

export interface StudyDay<T extends DatedLog> {
  date: string
  logs: T[]
  totalMinutes: number
}

// 글이 있는 날과, 글이 없어도 보여줄 날짜(오늘·선택한 날)를 최신 날짜부터 묶는다. 같은 날 글의 순서는 그대로 둔다.
export function groupByDate<T extends DatedLog>(logs: T[], alwaysShow: string[]): Array<StudyDay<T>> {
  const byDate = new Map<string, T[]>()
  for (const log of logs) byDate.set(log.studyDate, [...(byDate.get(log.studyDate) ?? []), log])
  for (const date of alwaysShow) if (!byDate.has(date)) byDate.set(date, [])
  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, dayLogs]) => ({
      date,
      logs: dayLogs,
      totalMinutes: dayLogs.reduce((sum, log) => sum + log.studyMinutes, 0),
    }))
}

export const FEED_WINDOW_DAYS = 30
export const FEED_MAX_DAYS = 365

// 목록은 오늘부터 30일씩 거슬러 올라가며 불러온다. page 0이 첫 창이다.
export function feedWindow(today: string, page: number): { from: string; to: string } {
  const to = addDays(today, -FEED_WINDOW_DAYS * page)
  return { from: addDays(to, -(FEED_WINDOW_DAYS - 1)), to }
}

export function hasMoreFeed(page: number): boolean {
  return (page + 1) * FEED_WINDOW_DAYS < FEED_MAX_DAYS
}
