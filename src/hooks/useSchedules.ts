import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSchedules, createSchedule } from '@/api/schedules'
import type { CreateScheduleRequest } from '@/api/types'

export const useSchedules = (params?: { from?: string; to?: string }) =>
  useQuery({ queryKey: ['schedules', params], queryFn: () => getSchedules(params) })

export const useCreateSchedule = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateScheduleRequest) => createSchedule(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  })
}
