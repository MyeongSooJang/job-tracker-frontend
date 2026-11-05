import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, type AxiosResponse } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { clearToken, getToken } from '@/lib/auth'
import Signup from '../Signup'

const signupMutate = vi.fn()
const sendMutate = vi.fn()
const confirmMutate = vi.fn()
const reset = vi.fn()

vi.mock('@/hooks/useAuthMutations', () => ({
  useSignup: () => ({ mutate: signupMutate, isPending: false, error: null }),
  useSendEmailVerification: () => ({ mutate: sendMutate, isPending: false, error: null, reset }),
  useConfirmEmailVerification: () => ({ mutate: confirmMutate, isPending: false, error: null, reset }),
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

type User = ReturnType<typeof userEvent.setup>

async function sendCode(user: User) {
  sendMutate.mockImplementation((_data, options) => options.onSuccess())
  await user.type(screen.getByLabelText('이메일'), 'hong@example.com')
  await user.click(screen.getByRole('button', { name: '인증 코드 받기' }))
}

async function verifyEmail(user: User) {
  confirmMutate.mockImplementation((_data, options) => options.onSuccess())
  await sendCode(user)
  await user.type(screen.getByLabelText('인증 코드'), '123456')
  await user.click(screen.getByRole('button', { name: '확인' }))
}

async function fillRest(user: User, password: string, confirm: string) {
  await user.type(screen.getByLabelText('이름'), '홍길동')
  await user.type(screen.getByLabelText('비밀번호', { exact: true }), password)
  await user.type(screen.getByLabelText('비밀번호 확인'), confirm)
  await user.click(screen.getByRole('button', { name: '회원가입' }))
}

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearToken()
  })

  it('이메일 인증 전에는 이름과 비밀번호 입력란이 보이지 않고 가입할 수 없다', () => {
    renderSignup()

    expect(screen.queryByLabelText('이름')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('비밀번호', { exact: true })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeDisabled()
  })

  it('인증 코드 받기를 누르면 이메일로 인증 코드를 요청하고 코드 입력란을 보여준다', async () => {
    renderSignup()

    await sendCode(userEvent.setup())

    expect(sendMutate).toHaveBeenCalledWith({ email: 'hong@example.com' }, expect.any(Object))
    expect(screen.getByLabelText('인증 코드')).toBeInTheDocument()
  })

  it('코드를 보낸 직후에는 쿨다운 동안 재발송할 수 없다', async () => {
    renderSignup()

    await sendCode(userEvent.setup())

    expect(screen.getByRole('button', { name: /재발송/ })).toBeDisabled()
  })

  it('코드가 6자리가 되기 전에는 확인할 수 없다', async () => {
    renderSignup()
    const user = userEvent.setup()
    await sendCode(user)

    await user.type(screen.getByLabelText('인증 코드'), '12345')

    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled()
  })

  it('인증 코드를 확인하면 이메일을 잠그고 이름과 비밀번호 입력란을 보여준다', async () => {
    renderSignup()

    await verifyEmail(userEvent.setup())

    expect(confirmMutate).toHaveBeenCalledWith(
      { email: 'hong@example.com', code: '123456' },
      expect.any(Object),
    )
    expect(screen.getByText('이메일 인증이 완료되었습니다.')).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toHaveAttribute('readonly')
    expect(screen.getByLabelText('이름')).toBeInTheDocument()
  })

  it('코드를 보낸 뒤 이메일을 바꾸면 코드 입력란이 사라진다', async () => {
    renderSignup()
    const user = userEvent.setup()
    await sendCode(user)

    await user.type(screen.getByLabelText('이메일'), 'x')

    expect(screen.queryByLabelText('인증 코드')).not.toBeInTheDocument()
  })

  it('인증 후 변경을 누르면 인증 단계로 돌아간다', async () => {
    renderSignup()
    const user = userEvent.setup()
    await verifyEmail(user)

    await user.click(screen.getByRole('button', { name: '변경' }))

    expect(screen.queryByLabelText('이름')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '인증 코드 받기' })).toBeInTheDocument()
  })

  it('비밀번호가 8자 미만이면 요청하지 않고 안내한다', async () => {
    renderSignup()
    const user = userEvent.setup()
    await verifyEmail(user)

    await fillRest(user, 'short12', 'short12')

    expect(screen.getByRole('alert')).toHaveTextContent('비밀번호는 8자 이상이어야 합니다.')
    expect(signupMutate).not.toHaveBeenCalled()
  })

  it('비밀번호 확인이 다르면 요청하지 않고 안내한다', async () => {
    renderSignup()
    const user = userEvent.setup()
    await verifyEmail(user)

    await fillRest(user, 'password1', 'password2')

    expect(screen.getByRole('alert')).toHaveTextContent('비밀번호가 일치하지 않습니다.')
    expect(signupMutate).not.toHaveBeenCalled()
  })

  it('입력이 올바르면 확인용 비밀번호를 제외하고 가입을 요청한다', async () => {
    renderSignup()
    const user = userEvent.setup()
    await verifyEmail(user)

    await fillRest(user, 'password1', 'password1')

    expect(signupMutate).toHaveBeenCalledWith(
      { email: 'hong@example.com', name: '홍길동', password: 'password1' },
      expect.any(Object),
    )
  })

  it('가입에 성공하면 토큰을 저장하고 마이페이지로 이동한다', async () => {
    signupMutate.mockImplementation((_data, options) => options.onSuccess({ accessToken: 'jwt-token' }))
    renderSignup()
    const user = userEvent.setup()
    await verifyEmail(user)

    await fillRest(user, 'password1', 'password1')

    expect(getToken()).toBe('jwt-token')
    expect(await screen.findByText('마이페이지 화면')).toBeInTheDocument()
  })

  it('인증이 만료되어 가입이 거절되면 인증 단계로 되돌린다', async () => {
    signupMutate.mockImplementation((_data, options) =>
      options.onError(new AxiosError('failed', '400', undefined, undefined, {
        status: 400,
        data: { code: 'EMAIL_NOT_VERIFIED', message: '이메일 인증이 필요합니다.' },
      } as AxiosResponse)))
    renderSignup()
    const user = userEvent.setup()
    await verifyEmail(user)

    await fillRest(user, 'password1', 'password1')

    expect(screen.queryByLabelText('이름')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '인증 코드 받기' })).toBeInTheDocument()
  })
})
