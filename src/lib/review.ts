import type { ApplicationStatus, ApplyRoute, InterviewAtmosphere } from '@/api/types'

// 전형 결과가 가장 먼저 읽히도록 상태별로 배지 색을 달리한다.
export const STAGE_TONE: Record<ApplicationStatus, string> = {
  ACCEPTED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  INTERVIEW: 'bg-brand-50 text-brand-600',
  RESUME_SUBMITTED: 'bg-surface text-ink-600',
}

// 값은 백엔드 InterviewAtmosphere / ApplyRoute enum과 일치해야 한다.
export const ATMOSPHERE_LABELS: Record<InterviewAtmosphere, string> = {
  COMFORTABLE: '편안함',
  NORMAL: '보통',
  TENSE: '경직',
}

export const ROUTE_LABELS: Record<ApplyRoute, string> = {
  ONLINE: '온라인 지원',
  REFERRAL: '지인 추천',
  RECRUITER: '채용 담당자 연락',
  OTHER: '기타',
}

export const DIFFICULTIES = [1, 2, 3, 4, 5] as const

const DIFFICULTY_LABELS = ['매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움']

export const difficultyLabel = (difficulty: number) => DIFFICULTY_LABELS[difficulty - 1]

// 입력창은 줄마다 질문 하나로 받는다. 공백뿐인 줄은 질문이 아니다.
export const parseQuestions = (text: string) =>
  text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')

export const joinQuestions = (questions: string[] | undefined) => (questions ?? []).join('\n')
