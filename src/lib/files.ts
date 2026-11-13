import type { FileType } from '@/api/types'
import { getErrorCode, getErrorMessage } from '@/lib/errors'

export const MAX_FILE_BYTES = 5 * 1024 * 1024

export const FILE_TYPES: readonly FileType[] = ['RESUME', 'PORTFOLIO', 'CERTIFICATE', 'ETC']

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  RESUME: '이력서',
  PORTFOLIO: '포트폴리오',
  CERTIFICATE: '자격증',
  ETC: '기타',
}

// 업로드 전에 형식/용량을 미리 검사한다. 통과하면 null, 아니면 사용자에게 보일 메시지. 최종 판단은 서버가 한다.
export function validateFile(file: File): string | null {
  const looksLikePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!looksLikePdf) return 'PDF 파일만 업로드할 수 있습니다.'
  if (file.size === 0) return '비어 있는 파일은 업로드할 수 없습니다.'
  if (file.size > MAX_FILE_BYTES) return '파일 크기는 5MB 이하여야 합니다.'
  return null
}

// 서버 message는 한국어라 그대로 쓰고, 사용자가 취할 행동이 있는 코드만 안내를 덧붙인다.
// 최대 개수는 서버 상수이므로 프론트에 숫자를 두지 않는다.
export function getFileErrorMessage(error: unknown, fallback: string): string {
  const message = getErrorMessage(error, fallback)
  switch (getErrorCode(error)) {
    case 'FILE_LIMIT_EXCEEDED':
      return `${message} 기존 파일을 지운 뒤 다시 올려 주세요.`
    case 'STORAGE_FAILED':
      return '저장소에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.'
    default:
      return message
  }
}
