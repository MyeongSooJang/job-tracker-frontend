import { apiClient } from '@/lib/axios'
import type { HeatmapDay, StudyLog, StudyLogCreateRequest, StudyLogUpdateRequest, StudyStats } from './types'

const BASE = '/api/me/study-logs'

export const getStudyLog = (id: number) =>
  apiClient.get<StudyLog>(`${BASE}/${id}`).then(r => r.data)

export const getStudyLogs = (from: string, to: string) =>
  apiClient.get<StudyLog[]>(BASE, { params: { from, to } }).then(r => r.data)

export const getHeatmap = (from: string, to: string) =>
  apiClient.get<HeatmapDay[]>(`${BASE}/heatmap`, { params: { from, to } }).then(r => r.data)

export const getStudyStats = () =>
  apiClient.get<StudyStats>(`${BASE}/stats`).then(r => r.data)

export const createStudyLog = (data: StudyLogCreateRequest) =>
  apiClient.post<StudyLog>(BASE, data).then(r => r.data)

export const updateStudyLog = (id: number, data: StudyLogUpdateRequest) =>
  apiClient.put<StudyLog>(`${BASE}/${id}`, data).then(r => r.data)

export const deleteStudyLog = (id: number) =>
  apiClient.delete(`${BASE}/${id}`).then(() => undefined)
