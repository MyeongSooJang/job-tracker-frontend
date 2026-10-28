import { apiClient } from '@/lib/axios'
import type { Review } from './types'

export const getReviews = () =>
  apiClient.get<Review[]>('/api/reviews').then(r => r.data)

export const writeReview = (id: number, content: string) =>
  apiClient.patch<Review>(`/api/reviews/${id}`, { content }).then(r => r.data)
