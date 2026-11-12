import { describe, it, expect } from 'vitest'
import { addOneMonth, resumeViewLabel } from '@/lib/application'

describe('resumeViewLabel', () => {
  it('열람 여부를 한글로 바꾼다', () => {
    expect(resumeViewLabel('VIEWED')).toBe('열람')
    expect(resumeViewLabel('NOT_VIEWED')).toBe('미열람')
  })

  it('값이 없으면 미열람으로 본다', () => {
    expect(resumeViewLabel(undefined)).toBe('미열람')
  })
})

describe('addOneMonth', () => {
  it('한 달 뒤 같은 날짜를 돌려준다', () => {
    expect(addOneMonth('2026-10-10')).toBe('2026-11-10')
  })

  it('연말은 다음 해 1월로 넘어간다', () => {
    expect(addOneMonth('2026-12-15')).toBe('2027-01-15')
  })

  it('다음 달에 같은 날짜가 없으면 말일로 맞춘다', () => {
    expect(addOneMonth('2026-01-31')).toBe('2026-02-28')
  })

  it('윤년 2월 말일을 지킨다', () => {
    expect(addOneMonth('2028-01-31')).toBe('2028-02-29')
  })

  it('31일이 있는 달에서 30일까지만 있는 달로 넘어가면 말일로 맞춘다', () => {
    expect(addOneMonth('2026-03-31')).toBe('2026-04-30')
  })
})
