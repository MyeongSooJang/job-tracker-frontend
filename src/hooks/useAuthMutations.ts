import { useMutation } from '@tanstack/react-query'
import { login, signup } from '@/api/auth'
import type { LoginRequest, SignupRequest } from '@/api/types'

export const useLogin = () =>
  useMutation({ mutationFn: (data: LoginRequest) => login(data) })

export const useSignup = () =>
  useMutation({ mutationFn: (data: SignupRequest) => signup(data) })
