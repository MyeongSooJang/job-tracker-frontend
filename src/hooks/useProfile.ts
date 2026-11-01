import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteResume, getMyProfile, updateMyProfile, uploadResume } from '@/api/profile'
import type { ProfileRequest } from '@/api/types'

const PROFILE_KEY = ['profile']

export const useProfile = () =>
  useQuery({ queryKey: PROFILE_KEY, queryFn: getMyProfile })

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProfileRequest) => updateMyProfile(data),
    onSuccess: profile => queryClient.setQueryData(PROFILE_KEY, profile),
  })
}

export const useUploadResume = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadResume(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  })
}

export const useDeleteResume = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteResume(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  })
}
