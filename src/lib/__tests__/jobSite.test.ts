import { describe, it, expect } from 'vitest'
import { JOB_SITES, jobSiteLabel } from '../jobSite'

describe('jobSite', () => {
  it('요청한 순서대로 사이트 목록을 제공한다', () => {
    expect(JOB_SITES).toEqual(['JOBKOREA', 'SARAMIN', 'GROUPBY', 'WANTED', 'COMPANY_WEBSITE', 'OTHER'])
  })

  it('사이트 값을 한글 이름으로 바꾼다', () => {
    expect(jobSiteLabel('JOBKOREA')).toBe('잡코리아')
    expect(jobSiteLabel('COMPANY_WEBSITE')).toBe('자사 홈페이지')
    expect(jobSiteLabel('OTHER')).toBe('기타')
  })

  it('사이트가 없는 이전 지원 건은 대시로 표시한다', () => {
    expect(jobSiteLabel(null)).toBe('-')
    expect(jobSiteLabel(undefined)).toBe('-')
  })
})
