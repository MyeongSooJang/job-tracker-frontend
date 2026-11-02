import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompanies, getCompany, getCompanyReviews, createCompany } from '@/api/companies'
import type { CreateCompanyRequest } from '@/api/types'

export const useCompanies = () =>
  useQuery({ queryKey: ['companies'], queryFn: getCompanies })

export const useCompany = (id: number) =>
  useQuery({ queryKey: ['companies', id], queryFn: () => getCompany(id) })

export const useCompanyReviews = (id: number) =>
  useQuery({ queryKey: ['companies', id, 'reviews'], queryFn: () => getCompanyReviews(id) })

export const useCreateCompany = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => createCompany(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })
}
