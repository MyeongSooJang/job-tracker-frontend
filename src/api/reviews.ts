import { apiClient } from '@/lib/axios'
import type { Review, WriteReviewRequest } from './types'

export const getReviews = () =>
  apiClient.get<Review[]>('/api/reviews').then(r => r.data)

export const writeReview = (id: number, data: WriteReviewRequest) =>
  apiClient.patch<Review>(`/api/reviews/${id}`, data).then(r => r.data)
