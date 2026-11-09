import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SproutIllustration from '../SproutIllustration'

const count = (container: HTMLElement, selector: string) => container.querySelectorAll(selector).length

describe('SproutIllustration', () => {
  it('라벨을 접근 가능한 이름으로 가진 이미지로 그려진다', () => {
    render(<SproutIllustration stage={2} label="새싹 3단계 쌍떡잎, 연속 4일" />)

    expect(screen.getByRole('img', { name: '새싹 3단계 쌍떡잎, 연속 4일' })).toBeInTheDocument()
  })

  it('씨앗 단계에는 줄기와 잎이 없다', () => {
    const { container } = render(<SproutIllustration stage={0} label="씨앗" />)

    expect(count(container, '.fill-ink-900')).toBe(0)
    expect(count(container, '.fill-leaf')).toBe(0)
    expect(count(container, '.fill-brand-500')).toBe(0)
  })

  it('싹 단계에는 줄기 하나와 잎 한 장이 있다', () => {
    const { container } = render(<SproutIllustration stage={1} label="싹" />)

    expect(count(container, '.fill-ink-900')).toBe(1)
    expect(count(container, '.fill-leaf')).toBe(1)
    expect(count(container, '.fill-brand-500')).toBe(0)
  })

  it.each([
    [2, 1],
    [3, 2],
    [4, 3],
    [5, 3],
  ])('%i단계에는 잎이 %i쌍 있다', (stage, pairs) => {
    const { container } = render(<SproutIllustration stage={stage as 2 | 3 | 4 | 5} label="식물" />)

    expect(count(container, '.fill-leaf')).toBe(pairs)
    expect(count(container, '.fill-brand-500')).toBe(pairs)
  })

  it('꽃은 마지막 단계에만 있다', () => {
    const early = render(<SproutIllustration stage={4} label="큰 식물" />)
    expect(count(early.container, '.fill-heat-4')).toBe(0)

    const last = render(<SproutIllustration stage={5} label="꽃" />)
    expect(count(last.container, '.fill-heat-4')).toBe(1)
    expect(count(last.container, '.fill-heat-2')).toBe(5)
  })
})
