import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getApplications, getApplication,
  createApplication, updateApplicationStatus,
} from '@/api/applications'
import type { ApplicationStatus, CreateApplicationRequest } from '@/api/types'

export const useApplications = () =>
  useQuery({ queryKey: ['applications'], queryFn: getApplications })

export const useApplication = (id: number) =>
  useQuery({ queryKey: ['applications', id], queryFn: () => getApplication(id), enabled: !!id })

export const useCreateApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => createApplication(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  })
}

export const useUpdateApplicationStatus = (id: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: ApplicationStatus) => updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['applications', id] })
      // 서류합격 시 백엔드가 후기를 자동 생성하므로 후기 목록도 갱신한다
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
