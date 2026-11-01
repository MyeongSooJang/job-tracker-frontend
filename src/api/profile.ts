import { apiClient } from '@/lib/axios'
import type { Profile, ProfileRequest, ResumeInfo } from './types'

export const getMyProfile = () =>
  apiClient.get<Profile>('/api/me/profile').then(r => r.data)

export const updateMyProfile = (data: ProfileRequest) =>
  apiClient.put<Profile>('/api/me/profile', data).then(r => r.data)

// 기본 Content-Type(application/json)이면 axios가 FormData를 JSON으로 직렬화하므로 multipart를 명시한다.
export const uploadResume = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient
    .put<ResumeInfo>('/api/me/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data)
}

export const downloadResume = () =>
  apiClient.get<Blob>('/api/me/resume', { responseType: 'blob' }).then(r => r.data)

export const deleteResume = () =>
  apiClient.delete('/api/me/resume').then(() => undefined)
