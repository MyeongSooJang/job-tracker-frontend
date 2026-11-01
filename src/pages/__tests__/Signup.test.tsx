import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { clearToken, getToken } from '@/lib/auth'
import Signup from '../Signup'

const mutate = vi.fn()

vi.mock('@/hooks/useAuthMutations', () => ({
  useSignup: () => ({ mutate, isPending: false, error: null }),
}))

const renderSignup = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/signup']}>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/mypage" element={<div>마이페이지 화면</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )

async function fillForm(user: ReturnType<typeof userEvent.setup>, password: string, confirm: string) {
  await user.type(screen.getByLabelText('이름'), '홍길동')
  await user.type(screen.getByLabelText('이메일'), 'hong@example.com')
  await user.type(screen.getByLabelText('비밀번호', { exact: true }), password)
  await user.type(screen.getByLabelText('비밀번호 확인'), confirm)
  await user.click(screen.getByRole('button', { name: '회원가입' }))
}

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearToken()
  })

  it('비밀번호가 8자 미만이면 요청하지 않고 안내한다', async () => {
    renderSignup()

    await fillForm(userEvent.setup(), 'short12', 'short12')

    expect(screen.getByRole('alert')).toHaveTextContent('비밀번호는 8자 이상이어야 합니다.')
    expect(mutate).not.toHaveBeenCalled()
  })

  it('비밀번호 확인이 다르면 요청하지 않고 안내한다', async () => {
    renderSignup()

    await fillForm(userEvent.setup(), 'password1', 'password2')

    expect(screen.getByRole('alert')).toHaveTextContent('비밀번호가 일치하지 않습니다.')
    expect(mutate).not.toHaveBeenCalled()
  })

  it('입력이 올바르면 확인용 비밀번호를 제외하고 가입을 요청한다', async () => {
    renderSignup()

    await fillForm(userEvent.setup(), 'password1', 'password1')

    expect(mutate).toHaveBeenCalledWith(
      { email: 'hong@example.com', name: '홍길동', password: 'password1' },
      expect.any(Object),
    )
  })

  it('가입에 성공하면 토큰을 저장하고 마이페이지로 이동한다', async () => {
    mutate.mockImplementation((_data, options) => options.onSuccess({ accessToken: 'jwt-token' }))
    renderSignup()

    await fillForm(userEvent.setup(), 'password1', 'password1')

    expect(getToken()).toBe('jwt-token')
    expect(await screen.findByText('마이페이지 화면')).toBeInTheDocument()
  })
})
