import type { ApplicationStatus } from '@/api/types'

// 상태 값은 백엔드 ApplicationStatus(4단계)와 일치해야 한다.
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  RESUME_SUBMITTED: '서류접수',
  INTERVIEW: '면접 진행',
  ACCEPTED: '최종합격',
  REJECTED: '불합격',
}

// 상태 변경 버튼 문구. 서류접수에서 INTERVIEW로 넘어가는 것은 "서류합격"이다.
export const ACTION_LABELS: Record<ApplicationStatus, string> = {
  RESUME_SUBMITTED: '서류접수',
  INTERVIEW: '서류합격',
  ACCEPTED: '최종합격',
  REJECTED: '불합격',
}

export const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  RESUME_SUBMITTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
}
