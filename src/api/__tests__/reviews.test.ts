import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import { getReviews, writeReview } from '@/api/reviews'

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn(), patch: vi.fn() },
}))

describe('reviews API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getReviews: GET /api/reviews를 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] })

    const result = await getReviews()

    expect(apiClient.get).toHaveBeenCalledWith('/api/reviews')
    expect(result).toEqual([])
  })

  it('writeReview: PATCH /api/reviews/{id}에 내용과 평점을 보낸다', async () => {
    const req = { content: '분위기가 좋았다', rating: 4 }
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { id: 1, ...req } })

    const result = await writeReview(1, req)

    expect(apiClient.patch).toHaveBeenCalledWith('/api/reviews/1', req)
    expect(result.rating).toBe(4)
  })
})
