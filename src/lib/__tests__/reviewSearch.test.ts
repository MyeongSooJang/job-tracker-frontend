import { describe, it, expect } from 'vitest'
import { filterReviews } from '../reviewSearch'
import type { Review } from '@/api/types'

const review = (id: number, company: string, position: string, extra: Partial<Review> = {}): Review => ({
  id,
  application: {
    id,
    company: { id, name: company, industry: 'IT', website: '', createdAt: '' },
    position,
    status: 'INTERVIEW',
    appliedDate: '2026-10-01',
    createdAt: '',
  },
  content: null,
  rating: null,
  createdAt: '2026-10-01T00:00:00',
  updatedAt: '2026-10-01T00:00:00',
  ...extra,
})

const reviews = [
  review(1, '카카오', '백엔드 개발자', { content: '분위기가 좋았다' }),
  review(2, '토스', '서버 개발자', { questions: ['트랜잭션 격리 수준을 설명해보세요'] }),
  review(3, 'Naver', '프론트엔드 개발자'),
]

const ids = (list: Review[]) => list.map(r => r.id)

describe('filterReviews', () => {
  it('검색어가 비어 있으면 전부 돌려준다', () => {
    expect(filterReviews(reviews, '')).toEqual(reviews)
    expect(filterReviews(reviews, '   ')).toEqual(reviews)
  })

  it('회사명으로 찾는다', () => {
    expect(ids(filterReviews(reviews, '카카오'))).toEqual([1])
  })

  it('직무로 찾는다', () => {
    expect(ids(filterReviews(reviews, '서버'))).toEqual([2])
  })

  it('후기 본문으로 찾는다', () => {
    expect(ids(filterReviews(reviews, '분위기'))).toEqual([1])
  })

  it('받은 질문으로 찾는다', () => {
    expect(ids(filterReviews(reviews, '격리 수준'))).toEqual([2])
  })

  it('대소문자와 앞뒤 공백을 무시한다', () => {
    expect(ids(filterReviews(reviews, '  naver '))).toEqual([3])
  })

  it('작성 전이라 본문과 질문이 없는 기록도 오류 없이 걸러낸다', () => {
    expect(filterReviews(reviews, '없는검색어')).toEqual([])
  })
})
