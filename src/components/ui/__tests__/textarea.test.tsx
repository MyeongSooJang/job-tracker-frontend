import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Textarea } from '../textarea'

describe('Textarea', () => {
  it('autoResize면 내용 높이에 맞춰 높이를 늘린다', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(240)

    render(<Textarea autoResize aria-label="메모" defaultValue="" value="여러 줄\n내용" onChange={() => {}} />)

    const el = screen.getByLabelText('메모') as HTMLTextAreaElement
    expect(el.style.height).toBe('240px')
    expect(el.className).toContain('overflow-hidden')
  })

  it('autoResize가 없으면 높이를 건드리지 않는다', () => {
    render(<Textarea aria-label="메모" defaultValue="내용" />)

    expect((screen.getByLabelText('메모') as HTMLTextAreaElement).style.height).toBe('')
  })
})
