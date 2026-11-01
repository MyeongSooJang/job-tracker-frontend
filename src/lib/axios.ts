import axios, { isAxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearToken, getToken, UNAUTHORIZED_EVENT } from '@/lib/auth'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

export function attachToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = getToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
}

// 토큰을 들고 보낸 요청이 401이면 만료/무효로 보고 로그아웃시킨다.
// 토큰 없이 보낸 로그인 실패(401)는 해당하지 않는다.
export function handleUnauthorized(error: unknown): Promise<never> {
  if (isAxiosError(error) && error.response?.status === 401 && getToken()) {
    clearToken()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }
  return Promise.reject(error)
}

apiClient.interceptors.request.use(attachToken)
apiClient.interceptors.response.use(response => response, handleUnauthorized)
