import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SproutIllustration from '../SproutIllustration'

// 색 클래스가 아니라 그림의 부위(data-part)로 센다. 색을 바꿔도 테스트가 깨지지 않는다.
const count = (container: HTMLElement, part: string) => container.querySelectorAll(`[data-part="${part}"]`).length

describe('SproutIllustration', () => {
  it('라벨을 접근 가능한 이름으로 가진 이미지로 그려진다', () => {
    render(<SproutIllustration stage={2} label="새싹 3단계 쌍떡잎, 연속 25일" />)

    expect(screen.getByRole('img', { name: '새싹 3단계 쌍떡잎, 연속 25일' })).toBeInTheDocument()
  })

  it.each([0, 1, 2, 3, 4, 5] as const)('%i단계에도 흙 접시와 가꾸는 소품이 있다', stage => {
    const { container } = render(<SproutIllustration stage={stage} label="새싹" />)

    expect(count(container, 'ground')).toBe(1)
    expect(count(container, 'watering-can')).toBe(1)
    expect(count(container, 'shovel')).toBe(1)
  })

  it('씨앗 단계에는 씨앗과 나오지 않은 싹의 윤곽만 있다', () => {
    const { container } = render(<SproutIllustration stage={0} label="씨앗" />)

    expect(count(container, 'seed')).toBe(1)
    expect(count(container, 'ghost')).toBe(1)
    expect(count(container, 'leaf')).toBe(0)
    expect(count(container, 'tier')).toBe(0)
  })

  it.each([
    [1, 2],
    [2, 2],
    [3, 6],
  ] as const)('%i단계에는 잎이 %i장 있다', (stage, leaves) => {
    const { container } = render(<SproutIllustration stage={stage} label="식물" />)

    expect(count(container, 'leaf')).toBe(leaves)
    expect(count(container, 'seed')).toBe(0)
    expect(count(container, 'tier')).toBe(0)
  })

  it('4단계는 잎 덩어리 두 단의 나무이고 꽃이 없다', () => {
    const { container } = render(<SproutIllustration stage={4} label="나무" />)

    expect(count(container, 'trunk')).toBe(1)
    expect(count(container, 'tier')).toBe(2)
    expect(count(container, 'blossom')).toBe(0)
  })

  it('5단계는 잎 덩어리 세 단의 나무이고 꽃이 일곱 송이 핀다', () => {
    const { container } = render(<SproutIllustration stage={5} label="꽃 핀 나무" />)

    expect(count(container, 'trunk')).toBe(1)
    expect(count(container, 'tier')).toBe(3)
    expect(count(container, 'blossom')).toBe(7)
  })
})
