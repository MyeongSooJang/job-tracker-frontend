import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInterviews, createInterview, addQuestion } from '@/api/interviews'
import type { CreateInterviewRequest, CreateQuestionRequest } from '@/api/types'

export const useInterviews = (applicationId: number) =>
  useQuery({
    queryKey: ['interviews', applicationId],
    queryFn: () => getInterviews(applicationId),
    enabled: !!applicationId,
  })

export const useCreateInterview = (applicationId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInterviewRequest) => createInterview(applicationId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews', applicationId] }),
  })
}

export const useAddQuestion = (applicationId: number, interviewId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuestionRequest) => addQuestion(applicationId, interviewId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews', applicationId] }),
  })
}
