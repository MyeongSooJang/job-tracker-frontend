import { describe, it, expect } from 'vitest'
import { clampPage } from '../pagination'

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
