import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createStudyLog, deleteStudyLog, getHeatmap, getStudyLog, getStudyLogs, getStudyStats, updateStudyLog,
} from '@/api/studyLogs'
import type { StudyLogCreateRequest, StudyLogUpdateRequest } from '@/api/types'
import { feedWindow, hasMoreFeed } from '@/lib/studyLog'

const STUDY_LOGS_KEY = ['study-logs']
const detailKey = (id: number) => [...STUDY_LOGS_KEY, 'detail', id]

export const useStudyLog = (id: number | undefined) =>
  useQuery({
    queryKey: detailKey(id ?? -1),
    queryFn: () => getStudyLog(id as number),
    enabled: id !== undefined,
  })

// 글쓰기 화면 하단의 "오늘의 다른 글" 칩용.
export const useDayStudyLogs = (date: string) =>
  useQuery({ queryKey: [...STUDY_LOGS_KEY, 'day', date], queryFn: () => getStudyLogs(date, date) })

// 둘러보기 목록: 오늘부터 30일 창씩 거슬러 올라가며 불러온다.
export const useStudyLogFeed = (today: string) =>
  useInfiniteQuery({
    queryKey: [...STUDY_LOGS_KEY, 'feed', today],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const { from, to } = feedWindow(today, pageParam)
      return getStudyLogs(from, to)
    },
    getNextPageParam: (_lastPage, _allPages, lastPageParam) =>
      hasMoreFeed(lastPageParam) ? lastPageParam + 1 : undefined,
  })

export const useHeatmap = (from: string, to: string) =>
  useQuery({ queryKey: [...STUDY_LOGS_KEY, 'heatmap', from, to], queryFn: () => getHeatmap(from, to) })

export const useStudyStats = () =>
  useQuery({ queryKey: [...STUDY_LOGS_KEY, 'stats'], queryFn: getStudyStats })

// 저장·삭제는 목록, 잔디, 통계에 모두 영향을 주므로 학습 기록 쿼리를 한꺼번에 갱신한다.
// 만들거나 고친 글은 상세 캐시에 바로 넣어 두어, 글쓰기 화면이 주소만 바뀔 때 로딩 상태로 돌아가지 않게 한다.
export const useCreateStudyLog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StudyLogCreateRequest) => createStudyLog(data),
    onSuccess: created => {
      queryClient.setQueryData(detailKey(created.id), created)
      void queryClient.invalidateQueries({ queryKey: STUDY_LOGS_KEY })
    },
  })
}

export const useUpdateStudyLog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StudyLogUpdateRequest }) => updateStudyLog(id, data),
    onSuccess: updated => {
      queryClient.setQueryData(detailKey(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: STUDY_LOGS_KEY })
    },
  })
}

export const useDeleteStudyLog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteStudyLog(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: detailKey(id) })
      void queryClient.invalidateQueries({ queryKey: STUDY_LOGS_KEY })
    },
  })
}
