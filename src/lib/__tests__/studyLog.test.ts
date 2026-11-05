import { describe, it, expect } from 'vitest'
import {
  FEED_MAX_DAYS, HEATMAP_WEEKS,
  addDays, buildMonthCells, buildHeatmapWeeks, feedWindow, formatDateLabel, formatDayHeading, formatMinutes,
  groupByDate, hasMoreFeed, heatLevel, heatmapCellLabel, heatmapMonthLabels, heatmapRange, monthRange,
  resolveWriteDate, shiftMonth, summarize, toDateKey, toMonthKey, weekdayLabel,
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

describe('addDays', () => {
  it('날짜를 하루 단위로 앞뒤로 옮긴다', () => {
    expect(addDays('2026-11-04', -4)).toBe('2026-10-31')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('monthRange', () => {
  it('그 달 1일부터 말일까지를 돌려준다', () => {
    expect(monthRange('2026-11')).toEqual({ from: '2026-11-01', to: '2026-11-30' })
    expect(monthRange('2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' })
  })
})

describe('formatDayHeading', () => {
  it('월 일 요일 형태의 머리글을 만든다', () => {
    expect(formatDayHeading('2026-11-04')).toBe('11월 4일 수요일')
  })
})

describe('resolveWriteDate', () => {
  const TODAY = '2026-11-04'

  it('값이 없으면 오늘이다', () => {
    expect(resolveWriteDate(null, TODAY)).toBe(TODAY)
  })

  it('오늘 이전의 올바른 날짜는 그대로 쓴다', () => {
    expect(resolveWriteDate('2026-11-03', TODAY)).toBe('2026-11-03')
    expect(resolveWriteDate(TODAY, TODAY)).toBe(TODAY)
  })

  it('미래 날짜는 오늘로 바꾼다', () => {
    expect(resolveWriteDate('2026-11-05', TODAY)).toBe(TODAY)
  })

  it('형식이 틀렸거나 없는 날짜는 오늘로 바꾼다', () => {
    expect(resolveWriteDate('abc', TODAY)).toBe(TODAY)
    expect(resolveWriteDate('2026-02-30', TODAY)).toBe(TODAY)
  })
})

describe('heatLevel', () => {
  it.each([
    [0, 0, 0],
    [1, 0, 1],
    [1, 29, 1],
    [1, 30, 2],
    [1, 89, 2],
    [1, 90, 3],
    [1, 179, 3],
    [1, 180, 4],
    [3, 1440, 4],
  ])('글 %i개 %i분이면 %i단계다', (count, minutes, level) => {
    expect(heatLevel(count, minutes)).toBe(level)
  })
})

describe('buildHeatmapWeeks', () => {
  // 2026-11-04는 수요일. 그 주(11-01 일요일 시작)가 마지막 열이다.
  const weeks = buildHeatmapWeeks('2026-11-04')

  it('53주 × 7일 격자를 만든다', () => {
    expect(weeks).toHaveLength(HEATMAP_WEEKS)
    expect(weeks.every(week => week.length === 7)).toBe(true)
  })

  it('첫 열은 52주 전 일요일에서 시작한다', () => {
    expect(weeks[0][0]).toBe('2025-11-02')
  })

  it('마지막 열은 오늘이 속한 주이고 오늘 이후 칸은 비어 있다', () => {
    expect(weeks[52]).toEqual(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', null, null, null])
  })
})

describe('heatmapRange', () => {
  it('잔디가 덮는 첫 날부터 오늘까지다', () => {
    expect(heatmapRange('2026-11-04')).toEqual({ from: '2025-11-02', to: '2026-11-04' })
  })
})

describe('heatmapMonthLabels', () => {
  const labels = heatmapMonthLabels(buildHeatmapWeeks('2026-11-04'))

  it('월이 바뀌는 열에 월 라벨을 붙인다', () => {
    expect(labels[0]).toEqual({ week: 0, label: '11월' })
    expect(labels[1]).toEqual({ week: 5, label: '12월' })
    expect(labels[labels.length - 1]).toEqual({ week: 52, label: '11월' })
  })

  it('첫 라벨 바로 뒤에 다음 달 라벨이 붙으면 겹치지 않게 첫 라벨을 뺀다', () => {
    // 오늘이 2026-03-29(일)이면 첫 열은 2025-03-30(3월)이고 바로 다음 열이 2025-04-06(4월)이다.
    const crowded = heatmapMonthLabels(buildHeatmapWeeks('2026-03-29'))

    expect(crowded[0]).toEqual({ week: 1, label: '4월' })
  })
})

describe('heatmapCellLabel', () => {
  it('글이 있으면 날짜와 글 수와 공부 시간을 알려준다', () => {
    expect(heatmapCellLabel('2026-11-04', { count: 2, minutes: 90 })).toBe('2026.11.04 (수) · 글 2개 · 1시간 30분')
  })

  it('글이 없으면 기록 없음이라고 알려준다', () => {
    expect(heatmapCellLabel('2026-11-04', undefined)).toBe('2026.11.04 (수) · 기록 없음')
  })
})

describe('groupByDate', () => {
  const log = (id: number, studyDate: string, studyMinutes: number) =>
    ({ id, studyDate, title: `글${id}`, content: '내용', studyMinutes })

  it('날짜별로 묶어 최신 날짜부터 돌려주고 글 순서는 유지한다', () => {
    const days = groupByDate([log(3, '2026-11-04', 30), log(2, '2026-11-04', 60), log(1, '2026-11-02', 10)], [])

    expect(days.map(day => day.date)).toEqual(['2026-11-04', '2026-11-02'])
    expect(days[0].logs.map(l => l.id)).toEqual([3, 2])
  })

  it('하루 공부 시간 합계를 낸다', () => {
    const [day] = groupByDate([log(2, '2026-11-04', 30), log(1, '2026-11-04', 60)], [])

    expect(day.totalMinutes).toBe(90)
  })

  it('글이 없어도 항상 보여줄 날짜는 빈 묶음으로 넣는다', () => {
    const days = groupByDate([log(1, '2026-11-02', 10)], ['2026-11-04', '2026-11-03'])

    expect(days.map(day => day.date)).toEqual(['2026-11-04', '2026-11-03', '2026-11-02'])
    expect(days[0]).toEqual({ date: '2026-11-04', logs: [], totalMinutes: 0 })
  })

  it('항상 보여줄 날짜에 글이 이미 있으면 중복하지 않는다', () => {
    const days = groupByDate([log(1, '2026-11-04', 10)], ['2026-11-04', '2026-11-04'])

    expect(days).toHaveLength(1)
    expect(days[0].logs).toHaveLength(1)
  })
})

describe('feedWindow', () => {
  it('첫 창은 오늘까지 30일이다', () => {
    expect(feedWindow('2026-11-04', 0)).toEqual({ from: '2026-10-06', to: '2026-11-04' })
  })

  it('다음 창은 직전 창 바로 앞 30일이다', () => {
    expect(feedWindow('2026-11-04', 1)).toEqual({ from: '2026-09-06', to: '2026-10-05' })
  })
})

describe('hasMoreFeed', () => {
  it('1년치를 덮을 때까지 다음 창이 있다', () => {
    expect(hasMoreFeed(0)).toBe(true)
    expect(hasMoreFeed(11)).toBe(true)
    expect(hasMoreFeed(12)).toBe(false)
    expect(13 * 30).toBeGreaterThanOrEqual(FEED_MAX_DAYS)
  })
})
