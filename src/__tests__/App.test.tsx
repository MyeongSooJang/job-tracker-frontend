import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clearToken, setToken } from '@/lib/auth'
import { AuthProvider } from '@/components/auth/AuthProvider'
import App from '../App'

vi.mock('@/pages/Dashboard', () => ({ default: () => <div>대시보드 화면</div> }))
vi.mock('@/pages/Intro', () => ({ default: () => <div>소개 화면</div> }))
vi.mock('@/pages/Login', () => ({ default: () => <div>로그인 화면</div> }))

const renderAt = (path: string) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )

describe('App 라우팅', () => {
  beforeEach(() => clearToken())

  it.each(['/', '/companies', '/applications', '/schedules', '/reviews', '/mypage', '/study-logs'])(
    '로그인하지 않고 %s에 접근하면 소개 화면으로 이동한다',
    path => {
      renderAt(path)
      expect(screen.getByText('소개 화면')).toBeInTheDocument()
    },
  )

  it('소개 화면은 로그인하지 않아도 볼 수 있다', () => {
    renderAt('/intro')
    expect(screen.getByText('소개 화면')).toBeInTheDocument()
  })

  it('로그인 화면은 로그인하지 않아도 직접 열 수 있다', () => {
    renderAt('/login')
    expect(screen.getByText('로그인 화면')).toBeInTheDocument()
  })

  it('로그인했다면 보호된 화면을 보여준다', () => {
    setToken('jwt-token')
    renderAt('/')
    expect(screen.getByText('대시보드 화면')).toBeInTheDocument()
  })
})
