import type { ResumeView } from '@/api/types'

export const RESUME_VIEW_LABELS: Record<ResumeView, string> = {
  VIEWED: '열람',
  NOT_VIEWED: '미열람',
}

// 서버는 항상 값을 내려주지만, 값이 없는 데이터도 화면이 깨지지 않게 미열람으로 본다.
export const resumeViewLabel = (view?: ResumeView) => RESUME_VIEW_LABELS[view ?? 'NOT_VIEWED']

// 서버의 LocalDate.plusMonths(1)과 같게 계산한다. 다음 달에 같은 날짜가 없으면 말일로 맞춘다(1/31 → 2/28).
export function addOneMonth(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const nextMonth = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  const mm = String(nextMonth.getMonth() + 1).padStart(2, '0')
  const dd = String(Math.min(day, lastDay)).padStart(2, '0')
  return `${nextMonth.getFullYear()}-${mm}-${dd}`
}
