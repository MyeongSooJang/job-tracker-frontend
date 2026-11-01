import { apiClient } from '@/lib/axios'
import type { LoginRequest, SignupRequest, TokenResponse } from './types'

export const signup = (data: SignupRequest) =>
  apiClient.post<TokenResponse>('/api/auth/signup', data).then(r => r.data)

export const login = (data: LoginRequest) =>
  apiClient.post<TokenResponse>('/api/auth/login', data).then(r => r.data)
