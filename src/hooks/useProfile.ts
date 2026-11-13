import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteFile, getMyProfile, updateMyProfile, uploadFile } from '@/api/profile'
import type { FileType, ProfileRequest } from '@/api/types'
import { getErrorCode } from '@/lib/errors'

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

export const useUploadFile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: FileType }) => uploadFile(file, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  })
}

export const useDeleteFile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteFile(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
    // 이미 지워졌거나 내 파일이 아니면 화면의 목록이 낡은 것이므로 다시 불러온다.
    onError: error => {
      if (getErrorCode(error) === 'FILE_NOT_FOUND') queryClient.invalidateQueries({ queryKey: PROFILE_KEY })
    },
  })
}
