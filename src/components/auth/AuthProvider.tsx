import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { clearToken, getToken, setToken, UNAUTHORIZED_EVENT } from '@/lib/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

// Provider 밖에서 렌더링되어도(예: 사이드바 단독 테스트) 미로그인 상태로 동작하도록 기본값을 둔다.
const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setTokenState] = useState<string | null>(getToken)

  const login = useCallback((newToken: string) => {
    setToken(newToken)
    setTokenState(newToken)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const value = useMemo(
    () => ({ isAuthenticated: token !== null, login, logout }),
    [token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
