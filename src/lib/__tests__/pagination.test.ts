import { describe, it, expect } from 'vitest'
import { clampPage, paginate, totalPages } from '../pagination'

describe('clampPage', () => {
  it('범위 안의 페이지는 그대로 둔다', () => {
    expect(clampPage(3, 10)).toBe(3)
  })

  it('1보다 작으면 1, 전체보다 크면 마지막 페이지로 맞춘다', () => {
    expect(clampPage(0, 10)).toBe(1)
    expect(clampPage(11, 10)).toBe(10)
  })

  it('전체가 0이어도 1을 돌려준다', () => {
    expect(clampPage(5, 0)).toBe(1)
  })
})

describe('totalPages', () => {
  it('나누어 떨어지지 않으면 올림한다', () => {
    expect(totalPages(17, 8)).toBe(3)
    expect(totalPages(16, 8)).toBe(2)
  })

  it('항목이 없어도 최소 1페이지다', () => {
    expect(totalPages(0, 8)).toBe(1)
  })
})

describe('paginate', () => {
  const items = Array.from({ length: 20 }, (_, i) => i + 1)

  it('요청한 페이지의 항목만 잘라 돌려준다', () => {
    expect(paginate(items, 1, 8)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(paginate(items, 3, 8)).toEqual([17, 18, 19, 20])
  })

  it('범위를 벗어난 페이지는 마지막 페이지로 맞춘다', () => {
    expect(paginate(items, 99, 8)).toEqual([17, 18, 19, 20])
  })

  it('빈 배열은 빈 배열을 돌려준다', () => {
    expect(paginate([], 1, 8)).toEqual([])
  })
})
