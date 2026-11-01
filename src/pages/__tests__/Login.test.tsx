import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { clearToken, getToken } from '@/lib/auth'
import Login from '../Login'

const mutate = vi.fn()
let hookState: { isPending: boolean; error: unknown } = { isPending: false, error: null }

vi.mock('@/hooks/useAuthMutations', () => ({
  useLogin: () => ({ mutate, ...hookState }),
}))

const renderLogin = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/mypage" element={<div>마이페이지 화면</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearToken()
    hookState = { isPending: false, error: null }
  })

  it('입력한 이메일과 비밀번호로 로그인을 요청한다', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('이메일'), 'hong@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password1')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(mutate).toHaveBeenCalledWith(
      { email: 'hong@example.com', password: 'password1' },
      expect.any(Object),
    )
  })

  it('로그인에 성공하면 토큰을 저장하고 마이페이지로 이동한다', async () => {
    mutate.mockImplementation((_data, options) => options.onSuccess({ accessToken: 'jwt-token' }))
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('이메일'), 'hong@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password1')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(getToken()).toBe('jwt-token')
    expect(await screen.findByText('마이페이지 화면')).toBeInTheDocument()
  })

  it('서버가 준 오류 메시지를 보여준다', () => {
    hookState = {
      isPending: false,
      error: new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 401,
        data: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
      } as never),
    }
    renderLogin()

    expect(screen.getByRole('alert')).toHaveTextContent('이메일 또는 비밀번호가 올바르지 않습니다.')
  })

  it('요청 중에는 버튼이 비활성화된다', () => {
    hookState = { isPending: true, error: null }
    renderLogin()

    expect(screen.getByRole('button', { name: '로그인 중...' })).toBeDisabled()
  })

  it('회원가입 링크가 존재한다', () => {
    renderLogin()

    expect(screen.getByRole('link', { name: '회원가입' })).toHaveAttribute('href', '/signup')
  })
})
