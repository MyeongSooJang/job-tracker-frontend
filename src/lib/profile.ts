import type { Profile, ProfileRequest } from '@/api/types'

const isFilled = (value: string | null | undefined) => !!value && value.trim().length > 0

// 완성도에 반영하는 항목 수: 연락처, 생년월일, 주소, 링크(하나라도), 학력, 경력, 희망 직무, 자기소개, 파일(종류 무관 1개 이상)
const COMPLETENESS_ITEMS = 9

export function calcCompleteness(profile: Profile): number {
  const filled = [
    isFilled(profile.phone),
    isFilled(profile.birthDate),
    isFilled(profile.address),
    isFilled(profile.githubUrl) || isFilled(profile.blogUrl) || isFilled(profile.portfolioUrl),
    isFilled(profile.education),
    isFilled(profile.career),
    isFilled(profile.desiredJob),
    isFilled(profile.introduction),
    profile.files.length > 0,
  ].filter(Boolean).length
  return Math.round((filled / COMPLETENESS_ITEMS) * 100)
}

export type PreparationGradeTone = 'rookie' | 'challenger' | 'striver' | 'diligent' | 'dreamer'

export interface PreparationGrade {
  name: string
  minMonths: number
  tone: PreparationGradeTone
}

// 등급 임계값의 단일 출처. minMonths 이상이면 해당 등급(이상~미만)이며 오름차순이어야 한다.
export const PREPARATION_GRADES: readonly PreparationGrade[] = [
  { name: '취준생', minMonths: 0, tone: 'rookie' },
  { name: '도전하는 청년', minMonths: 6, tone: 'challenger' },
  { name: '힘을내는 청년', minMonths: 12, tone: 'striver' },
  { name: '노력하는 청년', minMonths: 18, tone: 'diligent' },
  { name: '꿈을꾸는 청년', minMonths: 24, tone: 'dreamer' },
]

// 시작일(yyyy-MM-dd)부터 today까지 지난 만 개월 수(내림). 미래 날짜나 형식 오류는 0이다.
// 시작일의 일(day)이 이번 달에 없으면(예: 31일 시작, 2월) 이번 달 말일에 한 달이 찬 것으로 본다.
export function calcPreparationMonths(startDate: string, today: Date = new Date()): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate)
  if (!match) return 0
  const startYear = Number(match[1])
  const startMonth = Number(match[2])
  const startDay = Number(match[3])
  const nowYear = today.getFullYear()
  const nowMonth = today.getMonth() + 1
  const lastDayOfNowMonth = new Date(nowYear, nowMonth, 0).getDate()

  const months = (nowYear - startYear) * 12 + (nowMonth - startMonth)
  const reachedDay = today.getDate() >= Math.min(startDay, lastDayOfNowMonth)
  return Math.max(0, reachedDay ? months : months - 1)
}

export function getPreparationGrade(months: number): PreparationGrade {
  const reached = PREPARATION_GRADES.filter(grade => months >= grade.minMonths)
  return reached[reached.length - 1] ?? PREPARATION_GRADES[0]
}

// 비어 있는 선택 항목은 null로 보낸다. 특히 날짜는 빈 문자열이면 서버 파싱에 실패한다.
export function toProfileRequest(profile: Profile, changes: Partial<ProfileRequest>): ProfileRequest {
  const merged: ProfileRequest = {
    name: profile.name,
    phone: profile.phone,
    birthDate: profile.birthDate,
    jobSearchStartDate: profile.jobSearchStartDate,
    address: profile.address,
    githubUrl: profile.githubUrl,
    blogUrl: profile.blogUrl,
    portfolioUrl: profile.portfolioUrl,
    education: profile.education,
    career: profile.career,
    desiredJob: profile.desiredJob,
    introduction: profile.introduction,
    ...changes,
  }
  const blankToNull = (value: string | null) => (isFilled(value) ? value!.trim() : null)
  return {
    name: merged.name.trim(),
    phone: blankToNull(merged.phone),
    birthDate: blankToNull(merged.birthDate),
    jobSearchStartDate: blankToNull(merged.jobSearchStartDate),
    address: blankToNull(merged.address),
    githubUrl: blankToNull(merged.githubUrl),
    blogUrl: blankToNull(merged.blogUrl),
    portfolioUrl: blankToNull(merged.portfolioUrl),
    education: blankToNull(merged.education),
    career: blankToNull(merged.career),
    desiredJob: blankToNull(merged.desiredJob),
    introduction: blankToNull(merged.introduction),
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function initialOf(name: string): string {
  const trimmed = name.trim()
  return trimmed.length > 0 ? trimmed[0].toUpperCase() : '?'
}
