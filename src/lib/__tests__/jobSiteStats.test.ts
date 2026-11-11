import { describe, it, expect } from 'vitest'
import { formatPassRate, sortByPassRate } from '../jobSiteStats'
import type { JobSiteStat } from '@/api/types'

const stat = (jobSite: JobSiteStat['jobSite'], applicationCount: number, documentPassedCount: number): JobSiteStat => ({
  jobSite,
  applicationCount,
  documentPassedCount,
  documentPassRate: applicationCount === 0 ? 0 : documentPassedCount / applicationCount,
})

describe('sortByPassRate', () => {
  it('합격률이 높은 사이트를 앞에 둔다', () => {
    const sorted = sortByPassRate([stat('SARAMIN', 10, 2), stat('WANTED', 4, 3), stat('JOBKOREA', 5, 1)])

    expect(sorted.map(s => s.jobSite)).toEqual(['WANTED', 'SARAMIN', 'JOBKOREA'])
  })

  it('합격률이 같으면 지원 수가 많은 사이트를 앞에 둔다', () => {
    const sorted = sortByPassRate([stat('WANTED', 2, 1), stat('SARAMIN', 10, 5)])

    expect(sorted.map(s => s.jobSite)).toEqual(['SARAMIN', 'WANTED'])
  })

  it('원본 배열의 순서를 바꾸지 않는다', () => {
    const original = [stat('SARAMIN', 10, 2), stat('WANTED', 4, 3)]

    sortByPassRate(original)

    expect(original.map(s => s.jobSite)).toEqual(['SARAMIN', 'WANTED'])
  })
})

describe('formatPassRate', () => {
  it('비율을 반올림한 퍼센트로 표기한다', () => {
    expect(formatPassRate(0.3)).toBe('30%')
    expect(formatPassRate(1 / 3)).toBe('33%')
    expect(formatPassRate(2 / 3)).toBe('67%')
  })

  it('합격이 없으면 0%, 전부 합격이면 100%로 표기한다', () => {
    expect(formatPassRate(0)).toBe('0%')
    expect(formatPassRate(1)).toBe('100%')
  })
})
