import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSchedules, createSchedule } from '@/api/schedules'
import type { CreateScheduleRequest } from '@/api/types'

export const useSchedules = (params?: { from?: string; to?: string }) =>
  useQuery({ queryKey: ['schedules', params], queryFn: () => getSchedules(params) })

export const useCreateSchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateScheduleRequest) => createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      // 면접 일정 저장 시 백엔드가 상태를 INTERVIEW로 바꾸고 후기를 생성한다
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
