import { describe, it, expect } from 'vitest'
import type { Profile } from '@/api/types'
import {
  calcCompleteness, calcPreparationMonths, formatFileSize, getPreparationGrade, initialOf, toProfileRequest,
} from '@/lib/profile'

const emptyProfile: Profile = {
  email: 'hong@example.com',
  name: '홍길동',
  phone: null,
  birthDate: null,
  jobSearchStartDate: null,
  address: null,
  githubUrl: null,
  blogUrl: null,
  portfolioUrl: null,
  education: null,
  career: null,
  desiredJob: null,
  introduction: null,
  files: [],
}

describe('calcCompleteness', () => {
  it('아무것도 채우지 않으면 0%다', () => {
    expect(calcCompleteness(emptyProfile)).toBe(0)
  })

  it('채운 항목 비율을 반올림한 퍼센트로 반환한다', () => {
    const profile: Profile = {
      ...emptyProfile,
      phone: '010-1234-5678',
      desiredJob: '백엔드 개발자',
      files: [{ id: 1, type: 'ETC' as const, fileName: 'a.pdf', sizeBytes: 10, createdAt: '2026-11-01T10:00:00' }],
    }
    expect(calcCompleteness(profile)).toBe(33)
  })

  it('종류와 상관없이 파일이 하나라도 있으면 파일 항목을 채운 것으로 본다', () => {
    expect(calcCompleteness({ ...emptyProfile, files: [{ id: 1, type: 'ETC' as const, fileName: 'a.pdf', sizeBytes: 10, createdAt: '2026-11-01T10:00:00' }] })).toBe(11)
  })

  it('링크는 하나만 채워도 한 항목으로 센다', () => {
    const one = calcCompleteness({ ...emptyProfile, githubUrl: 'https://github.com/hong' })
    const three = calcCompleteness({
      ...emptyProfile, githubUrl: 'https://a', blogUrl: 'https://b', portfolioUrl: 'https://c',
    })
    expect(one).toBe(three)
  })

  it('공백만 있는 값은 채운 것으로 보지 않는다', () => {
    expect(calcCompleteness({ ...emptyProfile, introduction: '   ' })).toBe(0)
  })

  it('모두 채우면 100%다', () => {
    const full: Profile = {
      ...emptyProfile,
      phone: '010', birthDate: '1998-04-27', address: '서울', githubUrl: 'https://a',
      education: '대학', career: '인턴', desiredJob: '백엔드', introduction: '안녕',
      files: [{ id: 1, type: 'ETC' as const, fileName: 'a.pdf', sizeBytes: 10, createdAt: '2026-11-01T10:00:00' }],
    }
    expect(calcCompleteness(full)).toBe(100)
  })
})

describe('toProfileRequest', () => {
  it('변경하지 않은 값은 기존 프로필 값을 유지한다', () => {
    const profile = { ...emptyProfile, phone: '010-1234-5678', desiredJob: '백엔드' }

    const request = toProfileRequest(profile, { address: '서울' })

    expect(request.phone).toBe('010-1234-5678')
    expect(request.desiredJob).toBe('백엔드')
    expect(request.address).toBe('서울')
  })

  it('비어 있는 값은 null로 바꿔 보낸다 (날짜 파싱 오류 방지)', () => {
    const request = toProfileRequest(emptyProfile, { birthDate: '', phone: '   ' })

    expect(request.birthDate).toBeNull()
    expect(request.phone).toBeNull()
  })

  it('값의 앞뒤 공백을 제거한다', () => {
    const request = toProfileRequest(emptyProfile, { name: ' 홍길순 ', address: ' 서울 ' })

    expect(request.name).toBe('홍길순')
    expect(request.address).toBe('서울')
  })

  it('이메일과 파일 목록은 요청에 포함하지 않는다', () => {
    const request = toProfileRequest(emptyProfile, {})

    expect(request).not.toHaveProperty('email')
    expect(request).not.toHaveProperty('files')
  })
})

describe('formatFileSize', () => {
  it('단위에 맞게 표시한다', () => {
    expect(formatFileSize(512)).toBe('512B')
    expect(formatFileSize(1536)).toBe('1.5KB')
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0MB')
  })
})

describe('initialOf', () => {
  it('이름의 첫 글자를 반환하고 비어 있으면 물음표를 반환한다', () => {
    expect(initialOf('홍길동')).toBe('홍')
    expect(initialOf('alice')).toBe('A')
    expect(initialOf('  ')).toBe('?')
  })
})

describe('calcPreparationMonths', () => {
  const today = new Date(2026, 10, 2) // 2026-11-02

  it('같은 날이면 0개월이다', () => {
    expect(calcPreparationMonths('2026-11-02', today)).toBe(0)
  })

  it('일이 차지 않은 달은 내림한다', () => {
    expect(calcPreparationMonths('2026-10-03', today)).toBe(0)
    expect(calcPreparationMonths('2026-10-02', today)).toBe(1)
  })

  it.each([
    ['2026-06-02', 5],
    ['2026-05-02', 6],
    ['2025-12-02', 11],
    ['2025-11-02', 12],
    ['2025-06-02', 17],
    ['2025-05-02', 18],
    ['2024-12-02', 23],
    ['2024-11-02', 24],
  ])('시작일 %s은 %i개월이다', (start, months) => {
    expect(calcPreparationMonths(start, today)).toBe(months)
  })

  it('미래 날짜는 0이다', () => {
    expect(calcPreparationMonths('2026-12-01', today)).toBe(0)
    expect(calcPreparationMonths('2027-11-02', today)).toBe(0)
  })

  it('형식이 잘못되면 0이다', () => {
    expect(calcPreparationMonths('abc', today)).toBe(0)
  })

  it('월말 시작일은 짧은 달의 말일에 한 달이 찬다', () => {
    expect(calcPreparationMonths('2026-01-31', new Date(2026, 1, 27))).toBe(0)
    expect(calcPreparationMonths('2026-01-31', new Date(2026, 1, 28))).toBe(1)
  })

  it('윤년 2월 말일도 처리한다', () => {
    expect(calcPreparationMonths('2024-01-31', new Date(2024, 1, 28))).toBe(0)
    expect(calcPreparationMonths('2024-01-31', new Date(2024, 1, 29))).toBe(1)
    expect(calcPreparationMonths('2024-02-29', new Date(2025, 1, 28))).toBe(12)
  })

  it('연도를 넘겨도 계산한다', () => {
    expect(calcPreparationMonths('2025-12-15', new Date(2026, 0, 15))).toBe(1)
  })
})

describe('getPreparationGrade', () => {
  it.each([
    [0, '취준생'],
    [5, '취준생'],
    [6, '도전하는 청년'],
    [11, '도전하는 청년'],
    [12, '힘을내는 청년'],
    [17, '힘을내는 청년'],
    [18, '노력하는 청년'],
    [23, '노력하는 청년'],
    [24, '꿈을꾸는 청년'],
    [120, '꿈을꾸는 청년'],
  ])('%i개월이면 %s다', (months, name) => {
    expect(getPreparationGrade(months).name).toBe(name)
  })
})

describe('toProfileRequest 준비 시작일', () => {
  it('준비 시작일이 빈 문자열이면 null로 보낸다', () => {
    expect(toProfileRequest(emptyProfile, { jobSearchStartDate: '' }).jobSearchStartDate).toBeNull()
  })

  it('준비 시작일을 유지해서 보낸다', () => {
    const profile = { ...emptyProfile, jobSearchStartDate: '2025-05-02' }
    expect(toProfileRequest(profile, {}).jobSearchStartDate).toBe('2025-05-02')
  })
})
