import { apiClient } from '@/lib/axios'
import type { FileDownloadUrl, FileType, Profile, ProfileRequest, ResumeDownloadUrl, ResumeInfo, UserFile } from './types'

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

// Presigned URL에 Authorization 헤더가 같이 가면 S3가 요청을 거부하므로 apiClient 대신 fetch로 받는다.
export const downloadResume = async (): Promise<Blob> => {
  const { url } = await apiClient.get<ResumeDownloadUrl>('/api/me/resume').then(r => r.data)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`이력서 파일을 받지 못했습니다. (${response.status})`)
  return response.blob()
}

export const deleteResume = () =>
  apiClient.delete('/api/me/resume').then(() => undefined)

// 서버는 파일을 직접 주지 않고 짧게 유효한 주소를 준다. 만료되므로 클릭할 때마다 요청한다.
export const uploadFile = (file: File, type: FileType) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  return apiClient
    .post<UserFile>('/api/me/files', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(r => r.data)
}

export const downloadFile = async (id: number): Promise<Blob> => {
  const { url } = await apiClient.get<FileDownloadUrl>(`/api/me/files/${id}`).then(r => r.data)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`파일을 받지 못했습니다. (${response.status})`)
  return response.blob()
}

export const deleteFile = (id: number) =>
  apiClient.delete(`/api/me/files/${id}`).then(() => undefined)
