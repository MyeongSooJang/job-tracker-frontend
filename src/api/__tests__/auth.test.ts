import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import { confirmEmailVerification, login, sendEmailVerification, signup } from '@/api/auth'

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}))

describe('auth API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('signup: POST /api/auth/signup을 호출한다', async () => {
    const req = { email: 'hong@example.com', name: '홍길동', password: 'password1' }
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'jwt' } })

    const result = await signup(req)

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/signup', req)
    expect(result.accessToken).toBe('jwt')
  })

  it('sendEmailVerification: POST /api/auth/email-verifications를 호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

    await sendEmailVerification({ email: 'hong@example.com' })

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/email-verifications', { email: 'hong@example.com' })
  })

  it('confirmEmailVerification: POST /api/auth/email-verifications/confirm을 호출한다', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

    await confirmEmailVerification({ email: 'hong@example.com', code: '123456' })

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/auth/email-verifications/confirm',
      { email: 'hong@example.com', code: '123456' },
    )
  })

  it('login: POST /api/auth/login을 호출한다', async () => {
    const req = { email: 'hong@example.com', password: 'password1' }
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'jwt' } })

    const result = await login(req)

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', req)
    expect(result.accessToken).toBe('jwt')
  })
})
