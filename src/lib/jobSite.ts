import type { JobSite } from '@/api/types'

// 항목을 늘릴 때는 백엔드 JobSite enum에 상수를 추가하고 여기에 이름을 맞춘다.
export const JOB_SITE_LABELS: Record<JobSite, string> = {
  JOBKOREA: '잡코리아',
  SARAMIN: '사람인',
  GROUPBY: 'GroupBy',
  WANTED: 'Wanted',
  COMPANY_WEBSITE: '자사 홈페이지',
  OTHER: '기타',
}

export const JOB_SITES = Object.keys(JOB_SITE_LABELS) as JobSite[]

// 이전에 등록한 지원 건은 사이트가 없다.
export const jobSiteLabel = (site?: JobSite | null) => (site ? JOB_SITE_LABELS[site] : '-')

// 목록 필터 값. UNSET은 사이트를 채우지 않은 이전 지원 건만 골라 보는 항목이다.
export type JobSiteFilter = JobSite | 'ALL' | 'UNSET'

export const JOB_SITE_FILTER_OPTIONS: Array<{ value: JobSiteFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  ...JOB_SITES.map((site) => ({ value: site, label: JOB_SITE_LABELS[site] })),
  { value: 'UNSET', label: '미지정' },
]

export const matchesJobSite = (site: JobSite | null | undefined, filter: JobSiteFilter) => {
  if (filter === 'ALL') return true
  if (filter === 'UNSET') return !site
  return site === filter
}
