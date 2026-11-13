import { AxiosError } from 'axios'
import { describe, it, expect } from 'vitest'
import { FILE_TYPES, FILE_TYPE_LABELS, getFileErrorMessage, validateFile } from '@/lib/files'

const apiError = (status: number, code: string, message: string) =>
  new AxiosError('fail', String(status), undefined, undefined, {
    status, data: { code, message }, statusText: '', headers: {}, config: {} as never,
  })

describe('FILE_TYPE_LABELS', () => {
  it('네 가지 종류를 한글 라벨로 보여준다', () => {
    expect(FILE_TYPES).toEqual(['RESUME', 'PORTFOLIO', 'CERTIFICATE', 'ETC'])
    expect(FILE_TYPES.map(type => FILE_TYPE_LABELS[type])).toEqual(['이력서', '포트폴리오', '자격증', '기타'])
  })
})

describe('validateFile', () => {
  it('PDF는 통과한다', () => {
    expect(validateFile(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).toBeNull()
  })

  it('PDF가 아니면 안내한다', () => {
    expect(validateFile(new File(['x'], 'a.docx', { type: 'application/msword' }))).toBe('PDF 파일만 업로드할 수 있습니다.')
  })

  it('빈 파일은 안내한다', () => {
    expect(validateFile(new File([], 'a.pdf', { type: 'application/pdf' }))).toBe('비어 있는 파일은 업로드할 수 없습니다.')
  })

  it('5MB를 넘으면 안내한다', () => {
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'a.pdf', { type: 'application/pdf' })
    expect(validateFile(big)).toBe('파일 크기는 5MB 이하여야 합니다.')
  })
})

describe('getFileErrorMessage', () => {
  it('FILE_LIMIT_EXCEEDED는 서버 메시지에 파일을 지우고 다시 올리라는 안내를 붙인다', () => {
    const message = getFileErrorMessage(apiError(400, 'FILE_LIMIT_EXCEEDED', '파일은 최대 20개까지 저장할 수 있습니다.'), 'x')
    expect(message).toBe('파일은 최대 20개까지 저장할 수 있습니다. 기존 파일을 지운 뒤 다시 올려 주세요.')
  })

  it('STORAGE_FAILED는 잠시 후 재시도를 안내한다', () => {
    expect(getFileErrorMessage(apiError(502, 'STORAGE_FAILED', '저장소 오류'), 'x'))
      .toBe('저장소에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.')
  })

  it.each([
    ['INVALID_FILE_TYPE', 400, 'PDF 파일만 올릴 수 있습니다.'],
    ['FILE_TOO_LARGE', 413, '5MB를 넘는 파일입니다.'],
    ['EMPTY_FILE', 400, '빈 파일입니다.'],
    ['INVALID_FILE_CATEGORY', 400, '종류가 올바르지 않습니다.'],
    ['FILE_NOT_FOUND', 404, '이미 삭제된 파일입니다.'],
  ])('%s는 서버 메시지를 그대로 쓴다', (code, status, message) => {
    expect(getFileErrorMessage(apiError(status, code, message), 'x')).toBe(message)
  })

  it('응답이 없으면 fallback을 쓴다', () => {
    expect(getFileErrorMessage(new Error('network'), '업로드하지 못했습니다.')).toBe('업로드하지 못했습니다.')
  })
})
