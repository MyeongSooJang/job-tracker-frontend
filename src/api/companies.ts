import { apiClient } from '@/lib/axios'
import type { Company, CreateCompanyRequest } from './types'

export const getCompanies = () =>
  apiClient.get<Company[]>('/api/companies').then(r => r.data)

export const getCompany = (id: number) =>
  apiClient.get<Company>(`/api/companies/${id}`).then(r => r.data)

export const createCompany = (data: CreateCompanyRequest) =>
  apiClient.post<Company>('/api/companies', data).then(r => r.data)
