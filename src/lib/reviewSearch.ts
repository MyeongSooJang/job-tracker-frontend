import type { Review } from '@/api/types'

// 회사명, 직무, 후기 본문, 받은 질문에서 대소문자·앞뒤 공백을 무시하고 부분 일치로 찾는다.
export function filterReviews(reviews: Review[], query: string): Review[] {
  const keyword = query.trim().toLowerCase()
  if (keyword === '') return reviews
  return reviews.filter(r =>
    [r.application.company.name, r.application.position, r.content ?? '', ...(r.questions ?? [])].some(
      text => text.toLowerCase().includes(keyword),
    ),
  )
}
