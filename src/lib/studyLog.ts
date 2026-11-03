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

export function weekdayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return WEEKDAYS[new Date(year, month - 1, day).getDay()]
}

export function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return `${year}.${pad(month)}.${pad(day)} (${weekdayLabel(dateKey)})`
}

// 최근 글 목록용 한 줄 요약. 첫 비어 있지 않은 줄에서 제목·목록·인용 기호를 뗀다.
export function summarize(content: string, maxLength = 40): string {
  const firstLine = content.split('\n').map(line => line.trim()).find(line => line.length > 0) ?? ''
  const plain = firstLine.replace(/^(#{1,6}|[-*+>]|\d+\.)\s*/, '')
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain
}
