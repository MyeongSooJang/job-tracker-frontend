import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReviews, writeReview } from '@/api/reviews'
import type { WriteReviewRequest } from '@/api/types'

export const useReviews = () =>
  useQuery({ queryKey: ['reviews'], queryFn: getReviews })

export const useWriteReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WriteReviewRequest }) => writeReview(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
}
