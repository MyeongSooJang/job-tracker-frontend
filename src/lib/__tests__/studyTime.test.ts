import { describe, it, expect } from 'vitest'
import { monthlyBuckets, niceAxis, weeklyBuckets } from '@/lib/studyTime'

// 2026-11-10은 화요일이라 이번 주는 일요일 2026-11-08에 시작한다.
const TODAY = '2026-11-10'

describe('weeklyBuckets', () => {
  it('오늘이 속한 주를 마지막으로 하는 12주를 일요일 시작으로 만든다', () => {
    const buckets = weeklyBuckets([], TODAY)

    expect(buckets).toHaveLength(12)
    expect(buckets[0]).toMatchObject({ key: '2026-08-23', label: '8/23', tooltipLabel: '8월 23일 주' })
    expect(buckets[11]).toMatchObject({ key: '2026-11-08', label: '11/8', tooltipLabel: '11월 8일 주' })
  })

  it('글이 없는 주는 0분이다', () => {
    expect(weeklyBuckets([], TODAY).every(bucket => bucket.minutes === 0)).toBe(true)
  })

  it('한 주(일~토)의 분을 합친다', () => {
    const buckets = weeklyBuckets(
      [
        { date: '2026-11-01', minutes: 30 },
        { date: '2026-11-07', minutes: 45 },
        { date: '2026-11-08', minutes: 60 },
      ],
      TODAY,
    )

    expect(buckets.find(bucket => bucket.key === '2026-11-01')?.minutes).toBe(75)
    expect(buckets.find(bucket => bucket.key === '2026-11-08')?.minutes).toBe(60)
  })

  it('이번 주는 오늘까지만 합치고 오늘 이후 날짜는 무시한다', () => {
    const buckets = weeklyBuckets(
      [
        { date: '2026-11-08', minutes: 60 },
        { date: '2026-11-10', minutes: 90 },
        { date: '2026-11-11', minutes: 120 },
      ],
      TODAY,
    )

    expect(buckets[11].minutes).toBe(150)
  })

  it('12주보다 오래된 날짜는 무시한다', () => {
    const total = weeklyBuckets([{ date: '2026-08-22', minutes: 500 }], TODAY).reduce((sum, b) => sum + b.minutes, 0)

    expect(total).toBe(0)
  })

  it('달이 바뀌는 주는 한 묶음으로 합친다', () => {
    const buckets = weeklyBuckets(
      [
        { date: '2026-08-31', minutes: 30 },
        { date: '2026-09-01', minutes: 40 },
      ],
      TODAY,
    )

    expect(buckets.find(bucket => bucket.key === '2026-08-30')?.minutes).toBe(70)
  })

  it('이번 주만 진행 중이다', () => {
    const inProgress = weeklyBuckets([], TODAY).map(bucket => bucket.inProgress)

    expect(inProgress.filter(Boolean)).toHaveLength(1)
    expect(inProgress[11]).toBe(true)
  })

  it('일요일에도 그날부터 새 주가 시작된다', () => {
    const buckets = weeklyBuckets([{ date: '2026-11-08', minutes: 20 }], '2026-11-08')

    expect(buckets[11]).toMatchObject({ key: '2026-11-08', minutes: 20 })
  })
})

describe('monthlyBuckets', () => {
  it('이번 달을 마지막으로 하는 12개월을 만든다', () => {
    const buckets = monthlyBuckets([], TODAY)

    expect(buckets).toHaveLength(12)
    expect(buckets[0]).toMatchObject({ key: '2025-12', label: '12월', tooltipLabel: '2025년 12월' })
    expect(buckets[11]).toMatchObject({ key: '2026-11', label: '11월', tooltipLabel: '2026년 11월' })
  })

  it('한 달의 분을 합치고 글이 없는 달은 0분이다', () => {
    const buckets = monthlyBuckets(
      [
        { date: '2026-10-31', minutes: 30 },
        { date: '2026-11-01', minutes: 40 },
        { date: '2026-11-10', minutes: 50 },
      ],
      TODAY,
    )

    expect(buckets.find(bucket => bucket.key === '2026-10')?.minutes).toBe(30)
    expect(buckets.find(bucket => bucket.key === '2026-11')?.minutes).toBe(90)
    expect(buckets.find(bucket => bucket.key === '2026-09')?.minutes).toBe(0)
  })

  it('연도가 바뀌어도 이어진다', () => {
    const buckets = monthlyBuckets([{ date: '2026-01-05', minutes: 70 }], TODAY)

    expect(buckets.find(bucket => bucket.key === '2026-01')).toMatchObject({ label: '1월', minutes: 70 })
  })

  it('오늘 이후 날짜와 12개월보다 오래된 날짜는 무시한다', () => {
    const total = monthlyBuckets(
      [
        { date: '2026-11-11', minutes: 100 },
        { date: '2025-11-30', minutes: 100 },
      ],
      TODAY,
    ).reduce((sum, bucket) => sum + bucket.minutes, 0)

    expect(total).toBe(0)
  })

  it('이번 달만 진행 중이다', () => {
    const inProgress = monthlyBuckets([], TODAY).map(bucket => bucket.inProgress)

    expect(inProgress.filter(Boolean)).toHaveLength(1)
    expect(inProgress[11]).toBe(true)
  })
})

describe('niceAxis', () => {
  it.each([
    [0, 15, 15, [0, 15]],
    [10, 15, 15, [0, 15]],
    [60, 15, 60, [0, 15, 30, 45, 60]],
    [250, 120, 360, [0, 120, 240, 360]],
    [1000, 300, 1200, [0, 300, 600, 900, 1200]],
    [30000, 12000, 36000, [0, 12000, 24000, 36000]],
  ])('최댓값 %i분이면 단위 %i분, 맨 위 %i분이다', (max, step, top, ticks) => {
    expect(niceAxis(max)).toEqual({ top, step, ticks })
  })

  it('음수는 0으로 다룬다', () => {
    expect(niceAxis(-5)).toEqual({ top: 15, step: 15, ticks: [0, 15] })
  })
})
