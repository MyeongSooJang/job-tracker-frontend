import { GraduationCap, Link2, Target, User, type LucideIcon } from 'lucide-react'
import type { Profile } from '@/api/types'

export type ProfileFieldKey = keyof Omit<Profile, 'resume'>

export interface FieldDef {
  key: ProfileFieldKey
  label: string
  type: 'text' | 'date' | 'url' | 'textarea'
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  maxLength?: number
}

export interface SectionDef {
  id: 'basic' | 'links' | 'career' | 'about'
  title: string
  icon: LucideIcon
  fields: FieldDef[]
}

// 섹션을 추가하거나 항목을 바꿀 때는 이 설정만 고치면 ProfileSection이 그대로 렌더링한다.
export const PROFILE_SECTIONS: SectionDef[] = [
  {
    id: 'basic',
    title: '기본 정보',
    icon: User,
    fields: [
      { key: 'name', label: '이름', type: 'text', required: true },
      { key: 'email', label: '이메일', type: 'text', readOnly: true },
      { key: 'phone', label: '연락처', type: 'text', placeholder: '010-0000-0000', maxLength: 255 },
      { key: 'birthDate', label: '생년월일', type: 'date' },
      { key: 'jobSearchStartDate', label: '준비 시작일', type: 'date' },
      { key: 'address', label: '주소', type: 'text', maxLength: 255 },
    ],
  },
  {
    id: 'links',
    title: '링크',
    icon: Link2,
    fields: [
      { key: 'githubUrl', label: 'GitHub', type: 'url', placeholder: 'https://github.com/...', maxLength: 300 },
      { key: 'blogUrl', label: '블로그', type: 'url', placeholder: 'https://', maxLength: 300 },
      { key: 'portfolioUrl', label: '포트폴리오', type: 'url', placeholder: 'https://', maxLength: 300 },
    ],
  },
  {
    id: 'career',
    title: '학력 · 경력',
    icon: GraduationCap,
    fields: [
      { key: 'education', label: '학력 요약', type: 'textarea', placeholder: '최종 학력, 학교/전공 등', maxLength: 2000 },
      { key: 'career', label: '경력 요약', type: 'textarea', placeholder: '경력 연차, 주요 경험 등', maxLength: 2000 },
    ],
  },
  {
    id: 'about',
    title: '희망 직무 · 소개',
    icon: Target,
    fields: [
      { key: 'desiredJob', label: '희망 직무', type: 'text', placeholder: '예: 백엔드 개발자', maxLength: 255 },
      { key: 'introduction', label: '자기소개', type: 'textarea', placeholder: '나를 소개하는 글', maxLength: 2000 },
    ],
  },
]
