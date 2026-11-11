import type { JobSite } from '@/api/types'

// 사이트별 서류 합격 통계 한 줄. 서류 합격은 면접 일정이 잡힌 지원 건을 뜻한다.
// 응답 형태는 백엔드와 확정되면 api/types.ts로 옮긴다.
export interface JobSiteStat {
  jobSite: JobSite
  applicationCount: number
  documentPassedCount: number
  // 0.0 ~ 1.0. 지원이 0건이면 0
  documentPassRate: number
}

// 합격률이 높은 사이트부터. 비율이 같으면 지원 수가 많은(더 믿을 만한) 사이트를 앞에 둔다.
export const sortByPassRate = (stats: JobSiteStat[]): JobSiteStat[] =>
  [...stats].sort(
    (a, b) =>
      b.documentPassRate - a.documentPassRate || b.applicationCount - a.applicationCount,
  )

export const formatPassRate = (rate: number): string => `${Math.round(rate * 100)}%`
