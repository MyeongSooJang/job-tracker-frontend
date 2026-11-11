import type { JobSiteStat } from '@/api/types'

// 합격률이 높은 사이트부터. 비율이 같으면 지원 수가 많은(더 믿을 만한) 사이트를 앞에 둔다.
export const sortByPassRate = (stats: JobSiteStat[]): JobSiteStat[] =>
  [...stats].sort(
    (a, b) =>
      b.documentPassRate - a.documentPassRate || b.applicationCount - a.applicationCount,
  )

export const formatPassRate = (rate: number): string => `${Math.round(rate * 100)}%`
