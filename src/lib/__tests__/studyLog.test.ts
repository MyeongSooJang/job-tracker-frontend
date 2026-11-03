import { describe, it, expect } from 'vitest'
import {
  buildMonthCells, formatDateLabel, formatMinutes, shiftMonth, summarize, toDateKey, toMonthKey, weekdayLabel,
} from '@/lib/studyLog'

describe('toDateKey', () => {
  it('로컬 날짜를 yyyy-MM-dd로 만든다', () => {
    expect(toDateKey(new Date(2026, 10, 3))).toBe('2026-11-03')
  })
})

describe('toMonthKey', () => {
  it('날짜에서 yyyy-MM만 남긴다', () => {
    expect(toMonthKey('2026-11-03')).toBe('2026-11')
  })
})

describe('shiftMonth', () => {
  it('다음 달로 이동한다', () => {
    expect(shiftMonth('2026-11', 1)).toBe('2026-12')
  })

  it('연도를 넘어 이전 달로 이동한다', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })
})

describe('buildMonthCells', () => {
  it('월 시작이 일요일이면 앞을 비우지 않고 7의 배수로 뒤를 채운다', () => {
    // 2026-11-01은 일요일, 30일은 월요일 → 앞 0칸, 뒤 5칸
    const cells = buildMonthCells('2026-11')

    expect(cells[0]).toBe('2026-11-01')
    expect(cells[29]).toBe('2026-11-30')
    expect(cells).toHaveLength(35)
    expect(cells.slice(30)).toEqual([null, null, null, null, null])
  })

  it('월 시작 요일이 일요일이 아니면 앞쪽을 요일만큼 비운다', () => {
    // 2026-12-01은 화요일 → 앞 2칸
    const cells = buildMonthCells('2026-12')

    expect(cells.slice(0, 2)).toEqual([null, null])
    expect(cells[2]).toBe('2026-12-01')
  })
})

describe('formatMinutes', () => {
  it.each([
    [0, '0분'],
    [45, '45분'],
    [60, '1시간'],
    [90, '1시간 30분'],
    [1440, '24시간'],
  ])('%i분은 "%s"로 표시한다', (minutes, expected) => {
    expect(formatMinutes(minutes)).toBe(expected)
  })
})

describe('weekdayLabel', () => {
  it('날짜의 요일을 한 글자로 돌려준다', () => {
    expect(weekdayLabel('2026-11-01')).toBe('일')
    expect(weekdayLabel('2026-11-07')).toBe('토')
  })
})

describe('formatDateLabel', () => {
  it('날짜와 요일을 함께 보여준다', () => {
    expect(formatDateLabel('2026-11-03')).toBe('2026.11.03 (화)')
  })
})

describe('summarize', () => {
  it('첫 줄에서 마크다운 기호를 떼어 보여준다', () => {
    expect(summarize('## JPA 영속성 컨텍스트\n본문')).toBe('JPA 영속성 컨텍스트')
  })

  it('앞쪽 빈 줄은 건너뛴다', () => {
    expect(summarize('\n\n- 알고리즘 3문제')).toBe('알고리즘 3문제')
  })

  it('길면 잘라서 말줄임표를 붙인다', () => {
    expect(summarize('가'.repeat(50), 10)).toBe(`${'가'.repeat(10)}…`)
  })

  it('내용이 없으면 빈 문자열이다', () => {
    expect(summarize('  \n ')).toBe('')
  })
})
