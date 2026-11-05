import { useMutation } from '@tanstack/react-query'
import { confirmEmailVerification, login, sendEmailVerification, signup } from '@/api/auth'
import type {
  EmailVerificationConfirmRequest,
  EmailVerificationRequest,
  LoginRequest,
  SignupRequest,
} from '@/api/types'

export const useLogin = () =>
  useMutation({ mutationFn: (data: LoginRequest) => login(data) })

export const useSignup = () =>
  useMutation({ mutationFn: (data: SignupRequest) => signup(data) })

export const useSendEmailVerification = () =>
  useMutation({ mutationFn: (data: EmailVerificationRequest) => sendEmailVerification(data) })

export const useConfirmEmailVerification = () =>
  useMutation({ mutationFn: (data: EmailVerificationConfirmRequest) => confirmEmailVerification(data) })
