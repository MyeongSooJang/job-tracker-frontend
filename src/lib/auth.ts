const TOKEN_KEY = 'job-tracker.accessToken'

// 토큰이 만료/무효가 되어 서버가 401을 돌려줬을 때 AuthProvider가 듣는 이벤트
export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 메모리 상태로만 로그인이 유지된다.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // 위와 동일
  }
}
