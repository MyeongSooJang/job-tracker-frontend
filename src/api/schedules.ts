import { apiClient } from '@/lib/axios'
import type { Schedule, CreateScheduleRequest } from './types'

export const getSchedules = (params?: { from?: string; to?: string }) =>
  apiClient.get<Schedule[]>('/api/schedules', { params }).then(r => r.data)

export const createSchedule = (data: CreateScheduleRequest) =>
  apiClient.post<Schedule>('/api/schedules', data).then(r => r.data)
