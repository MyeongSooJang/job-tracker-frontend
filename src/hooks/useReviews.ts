import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReviews, writeReview } from '@/api/reviews'

export const useReviews = () =>
  useQuery({ queryKey: ['reviews'], queryFn: getReviews })

export const useWriteReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => writeReview(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
}
