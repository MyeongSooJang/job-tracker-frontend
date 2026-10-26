import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompanies, createCompany } from '@/api/companies'
import type { CreateCompanyRequest } from '@/api/types'

export const useCompanies = () =>
  useQuery({ queryKey: ['companies'], queryFn: getCompanies })

export const useCreateCompany = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => createCompany(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })
}
