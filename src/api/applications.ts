import { apiClient } from '@/lib/axios'
import type { Application, ApplicationStatus, CreateApplicationRequest } from './types'

export const getApplications = () =>
  apiClient.get<Application[]>('/api/applications').then(r => r.data)

export const getApplication = (id: number) =>
  apiClient.get<Application>(`/api/applications/${id}`).then(r => r.data)

export const createApplication = (data: CreateApplicationRequest) =>
  apiClient.post<Application>('/api/applications', data).then(r => r.data)

export const updateApplicationStatus = (id: number, status: ApplicationStatus) =>
  apiClient.patch<Application>(`/api/applications/${id}/status`, { status }).then(r => r.data)
