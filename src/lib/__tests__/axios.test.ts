import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { attachToken, handleUnauthorized } from '@/lib/axios'
import { clearToken, getToken, setToken, UNAUTHORIZED_EVENT } from '@/lib/auth'

const errorWithStatus = (status: number) =>
  new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, { status } as never)

describe('attachToken', () => {
  beforeEach(() => clearToken())

  it('토큰이 있으면 Authorization 헤더를 붙인다', () => {
    setToken('my-token')
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig

    const result = attachToken(config)

    expect(result.headers.get('Authorization')).toBe('Bearer my-token')
  })

  it('토큰이 없으면 헤더를 붙이지 않는다', () => {
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig

    const result = attachToken(config)

    expect(result.headers.get('Authorization')).toBeUndefined()
  })
})

describe('handleUnauthorized', () => {
  const listener = vi.fn()

  beforeEach(() => {
    clearToken()
    listener.mockClear()
    window.addEventListener(UNAUTHORIZED_EVENT, listener)
  })

  afterEach(() => window.removeEventListener(UNAUTHORIZED_EVENT, listener))

  it('토큰을 들고 보낸 요청이 401이면 토큰을 지우고 이벤트를 발생시킨다', async () => {
    setToken('expired-token')
    const error = errorWithStatus(401)

    await expect(handleUnauthorized(error)).rejects.toBe(error)

    expect(getToken()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('토큰 없이 받은 401(로그인 실패)은 이벤트를 발생시키지 않는다', async () => {
    const error = errorWithStatus(401)

    await expect(handleUnauthorized(error)).rejects.toBe(error)

    expect(listener).not.toHaveBeenCalled()
  })

  it('401이 아닌 오류는 토큰을 유지한다', async () => {
    setToken('valid-token')
    const error = errorWithStatus(500)

    await expect(handleUnauthorized(error)).rejects.toBe(error)

    expect(getToken()).toBe('valid-token')
    expect(listener).not.toHaveBeenCalled()
  })
})
