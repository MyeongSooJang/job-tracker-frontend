import { describe, it, expect } from 'vitest'
import { recentApplications } from '../recentApplications'
import type { Application } from '@/api/types'

const NOW = new Date(2026, 10, 11, 15, 30) // 2026-11-11 오후

const app = (id: number, appliedDate: string): Application => ({
  id,
  company: { id, name: `회사${id}`, industry: '', website: '', createdAt: '' },
  position: '백엔드',
  status: 'RESUME_SUBMITTED',
  appliedDate,
  jobSite: 'WANTED',
  createdAt: '',
})

describe('recentApplications', () => {
  it('오늘을 포함해 7일 안에 지원한 건만 남긴다', () => {
    const result = recentApplications(
      [app(1, '2026-11-11'), app(2, '2026-11-05'), app(3, '2026-11-04')],
      NOW,
      7,
    )

    expect(result.map(a => a.id)).toEqual([1, 2])
  })

  it('경계 날짜는 포함하고 하루 전은 제외한다', () => {
    const result = recentApplications([app(1, '2026-11-05'), app(2, '2026-11-04')], NOW, 7)

    expect(result.map(a => a.id)).toEqual([1])
  })

  it('지원일이 최신인 건을 앞에 둔다', () => {
    const result = recentApplications(
      [app(1, '2026-11-06'), app(2, '2026-11-10'), app(3, '2026-11-08')],
      NOW,
      7,
    )

    expect(result.map(a => a.id)).toEqual([2, 3, 1])
  })

  it('지원일이 같으면 나중에 등록한 건을 앞에 둔다', () => {
    const result = recentApplications([app(1, '2026-11-10'), app(2, '2026-11-10')], NOW, 7)

    expect(result.map(a => a.id)).toEqual([2, 1])
  })

  it('기간 안에 지원한 건이 없으면 빈 목록을 돌려준다', () => {
    expect(recentApplications([app(1, '2026-10-01')], NOW, 7)).toEqual([])
  })

  it('원본 배열의 순서를 바꾸지 않는다', () => {
    const original = [app(1, '2026-11-06'), app(2, '2026-11-10')]

    recentApplications(original, NOW, 7)

    expect(original.map(a => a.id)).toEqual([1, 2])
  })
})
