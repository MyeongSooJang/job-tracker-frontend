import { apiClient } from '@/lib/axios'
import type { Company, CompanyReview, CompanyWithStats, CreateCompanyRequest } from './types'

export const getCompanies = () =>
  apiClient.get<CompanyWithStats[]>('/api/companies').then(r => r.data)

export const getCompany = (id: number) =>
  apiClient.get<CompanyWithStats>(`/api/companies/${id}`).then(r => r.data)

export const getCompanyReviews = (id: number) =>
  apiClient.get<CompanyReview[]>(`/api/companies/${id}/reviews`).then(r => r.data)

export const createCompany = (data: CreateCompanyRequest) =>
  apiClient.post<Company>('/api/companies', data).then(r => r.data)
