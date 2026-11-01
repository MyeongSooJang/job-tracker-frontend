import { isAxiosError } from 'axios'

// 백엔드 ErrorResponse({ code, message })의 한글 메시지를 우선 사용하고, 없으면 fallback을 쓴다.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message
    if (typeof message === 'string' && message.length > 0) return message
  }
  return fallback
}
