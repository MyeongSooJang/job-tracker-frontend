import { describe, it, expect } from 'vitest'
import { JOB_SITES, JOB_SITE_FILTER_OPTIONS, jobSiteLabel, matchesJobSite } from '../jobSite'

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

  it('필터 목록은 전체로 시작하고 미지정으로 끝난다', () => {
    const values = JOB_SITE_FILTER_OPTIONS.map((o) => o.value)

    expect(values[0]).toBe('ALL')
    expect(values.at(-1)).toBe('UNSET')
    expect(values).toHaveLength(JOB_SITES.length + 2)
  })

  describe('matchesJobSite', () => {
    it('전체는 사이트가 없는 지원 건도 포함한다', () => {
      expect(matchesJobSite('SARAMIN', 'ALL')).toBe(true)
      expect(matchesJobSite(null, 'ALL')).toBe(true)
    })

    it('특정 사이트는 그 사이트의 지원 건만 포함한다', () => {
      expect(matchesJobSite('SARAMIN', 'SARAMIN')).toBe(true)
      expect(matchesJobSite('WANTED', 'SARAMIN')).toBe(false)
      expect(matchesJobSite(null, 'SARAMIN')).toBe(false)
    })

    it('미지정은 사이트가 없는 지원 건만 포함한다', () => {
      expect(matchesJobSite(null, 'UNSET')).toBe(true)
      expect(matchesJobSite(undefined, 'UNSET')).toBe(true)
      expect(matchesJobSite('OTHER', 'UNSET')).toBe(false)
    })
  })
})
