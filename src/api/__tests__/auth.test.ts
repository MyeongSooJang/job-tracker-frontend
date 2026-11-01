import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import { login, signup } from '@/api/auth'

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

  it('login: POST /api/auth/login을 호출한다', async () => {
    const req = { email: 'hong@example.com', password: 'password1' }
    vi.mocked(apiClient.post).mockResolvedValue({ data: { accessToken: 'jwt' } })

    const result = await login(req)

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', req)
    expect(result.accessToken).toBe('jwt')
  })
})
