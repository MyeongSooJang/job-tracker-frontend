import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  deleteStudyLog, getRecentStudyLogs, getStudyLog, getStudyLogsByMonth, getStudyStats, saveStudyLog,
} from '@/api/studyLogs'
import type { StudyLogRequest } from '@/api/types'

const STUDY_LOGS_KEY = ['study-logs']

export const useStudyLog = (date: string) =>
  useQuery({ queryKey: [...STUDY_LOGS_KEY, 'day', date], queryFn: () => getStudyLog(date) })

export const useMonthlyStudyLogs = (month: string) =>
  useQuery({ queryKey: [...STUDY_LOGS_KEY, 'month', month], queryFn: () => getStudyLogsByMonth(month) })

export const useRecentStudyLogs = () =>
  useQuery({ queryKey: [...STUDY_LOGS_KEY, 'recent'], queryFn: getRecentStudyLogs })

export const useStudyStats = () =>
  useQuery({ queryKey: [...STUDY_LOGS_KEY, 'stats'], queryFn: getStudyStats })

// 저장·삭제는 상세, 달력, 최근 글, 통계에 모두 영향을 주므로 학습 기록 쿼리를 한꺼번에 갱신한다.
export const useSaveStudyLog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: StudyLogRequest }) => saveStudyLog(date, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDY_LOGS_KEY }),
  })
}

export const useDeleteStudyLog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (date: string) => deleteStudyLog(date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDY_LOGS_KEY }),
  })
}
