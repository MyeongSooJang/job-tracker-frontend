import { AxiosError, type AxiosResponse } from 'axios'
import { describe, it, expect } from 'vitest'
import { getErrorCode, getErrorMessage } from '@/lib/errors'

const axiosError = (data: unknown) =>
  new AxiosError('failed', '400', undefined, undefined, { status: 400, data } as AxiosResponse)

describe('errors', () => {
  it('getErrorCode: 백엔드 에러 응답의 code를 반환한다', () => {
    expect(getErrorCode(axiosError({ code: 'EMAIL_NOT_VERIFIED', message: '인증 필요' }))).toBe('EMAIL_NOT_VERIFIED')
  })

  it('getErrorCode: axios 에러가 아니면 undefined를 반환한다', () => {
    expect(getErrorCode(new Error('x'))).toBeUndefined()
  })

  it('getErrorMessage: 백엔드 메시지가 있으면 그것을 쓴다', () => {
    expect(getErrorMessage(axiosError({ message: '인증 필요' }), 'fallback')).toBe('인증 필요')
  })

  it('getErrorMessage: 백엔드 메시지가 없으면 fallback을 쓴다', () => {
    expect(getErrorMessage(new Error('x'), 'fallback')).toBe('fallback')
  })
})
