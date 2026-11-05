import { apiClient } from '@/lib/axios'
import type {
  EmailVerificationConfirmRequest,
  EmailVerificationRequest,
  LoginRequest,
  SignupRequest,
  TokenResponse,
} from './types'

export const sendEmailVerification = (data: EmailVerificationRequest) =>
  apiClient.post<void>('/api/auth/email-verifications', data).then(() => undefined)

export const confirmEmailVerification = (data: EmailVerificationConfirmRequest) =>
  apiClient.post<void>('/api/auth/email-verifications/confirm', data).then(() => undefined)

export const signup = (data: SignupRequest) =>
  apiClient.post<TokenResponse>('/api/auth/signup', data).then(r => r.data)

export const login = (data: LoginRequest) =>
  apiClient.post<TokenResponse>('/api/auth/login', data).then(r => r.data)
