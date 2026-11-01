import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { clearToken, setToken, UNAUTHORIZED_EVENT } from '@/lib/auth'
import { AuthProvider } from '../AuthProvider'
import RequireAuth from '../RequireAuth'

const renderProtected = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/mypage']}>
          <Routes>
            <Route path="/login" element={<div>로그인 화면</div>} />
            <Route path="/mypage" element={<RequireAuth><div>보호된 화면</div></RequireAuth>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )

describe('RequireAuth', () => {
  beforeEach(() => clearToken())

  it('로그인하지 않았으면 로그인 화면으로 이동한다', () => {
    renderProtected()

    expect(screen.getByText('로그인 화면')).toBeInTheDocument()
    expect(screen.queryByText('보호된 화면')).not.toBeInTheDocument()
  })

  it('로그인했다면 보호된 화면을 보여준다', () => {
    setToken('jwt-token')
    renderProtected()

    expect(screen.getByText('보호된 화면')).toBeInTheDocument()
  })

  it('토큰이 만료되어 401 이벤트가 오면 로그인 화면으로 이동한다', () => {
    setToken('jwt-token')
    renderProtected()
    expect(screen.getByText('보호된 화면')).toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    })

    expect(screen.getByText('로그인 화면')).toBeInTheDocument()
  })
})
