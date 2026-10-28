import { apiClient } from '@/lib/axios'
import type { Interview, CreateInterviewRequest, CreateQuestionRequest } from './types'

export const getInterviews = (applicationId: number) =>
  apiClient.get<Interview[]>(`/api/applications/${applicationId}/interviews`).then(r => r.data)

export const createInterview = (applicationId: number, data: CreateInterviewRequest) =>
  apiClient.post<Interview>(`/api/applications/${applicationId}/interviews`, data).then(r => r.data)

export const addQuestion = (applicationId: number, interviewId: number, data: CreateQuestionRequest) =>
  apiClient
    .post<Interview>(`/api/applications/${applicationId}/interviews/${interviewId}/questions`, data)
    .then(r => r.data)

export const evaluateInterview = (applicationId: number, interviewId: number, score: number) =>
  apiClient
    .patch<Interview>(`/api/applications/${applicationId}/interviews/${interviewId}/score`, { score })
    .then(r => r.data)
