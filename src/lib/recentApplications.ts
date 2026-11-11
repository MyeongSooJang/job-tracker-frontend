import type { Application } from '@/api/types'

// 대시보드 "최근 지원 현황"에 보여줄 기간(일)과 처음에 보여줄 개수
export const RECENT_DAYS = 7
export const RECENT_VISIBLE = 5

// yyyy-MM-dd 문자열을 시간대 어긋남 없이 그 날 0시(로컬)로 읽는다.
const toLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// 오늘을 포함해 최근 days일 안에 지원한 건만 최신순으로 돌려준다.
// 지원일이 같으면 나중에 등록한 건(id가 큰 쪽)을 앞에 둔다.
export function recentApplications(applications: Application[], now: Date, days: number): Application[] {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1))
  return applications
    .filter(a => toLocalDate(a.appliedDate).getTime() >= from.getTime())
    .sort(
      (a, b) =>
        toLocalDate(b.appliedDate).getTime() - toLocalDate(a.appliedDate).getTime() || b.id - a.id,
    )
}
