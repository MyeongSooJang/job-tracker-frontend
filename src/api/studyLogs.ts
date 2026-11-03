import { isAxiosError } from 'axios'
import { apiClient } from '@/lib/axios'
import type { StudyLog, StudyLogRequest, StudyStats } from './types'

const BASE = '/api/me/study-logs'

// 기록이 없는 날은 오류가 아니라 "아직 안 쓴 날"이므로 404를 null로 바꿔 돌려준다.
export const getStudyLog = (date: string) =>
  apiClient
    .get<StudyLog>(`${BASE}/${date}`)
    .then(r => r.data)
    .catch(error => {
      if (isAxiosError(error) && error.response?.status === 404) return null
      throw error
    })

export const getStudyLogsByMonth = (month: string) =>
  apiClient.get<StudyLog[]>(BASE, { params: { month } }).then(r => r.data)

export const getRecentStudyLogs = () =>
  apiClient.get<StudyLog[]>(`${BASE}/recent`).then(r => r.data)

export const getStudyStats = () =>
  apiClient.get<StudyStats>(`${BASE}/stats`).then(r => r.data)

export const saveStudyLog = (date: string, data: StudyLogRequest) =>
  apiClient.put<StudyLog>(`${BASE}/${date}`, data).then(r => r.data)

export const deleteStudyLog = (date: string) =>
  apiClient.delete(`${BASE}/${date}`).then(() => undefined)
