import { describe, it, expect, vi } from 'vitest'
import { buildColorToolbar, HIGHLIGHT_COLORS, TEXT_COLORS } from '../colorToolbar'

describe('buildColorToolbar', () => {
  it('글자색, 배경색, 지우기 항목을 하나의 색 그룹으로 추가한다', () => {
    const items: string[] = []
    const addItem = vi.fn((key: string) => {
      items.push(key)
      return group
    })
    const group = { addItem }
    const addGroup = vi.fn(() => group)

    buildColorToolbar({ addGroup })

    expect(addGroup).toHaveBeenCalledWith('color', '색')
    expect(items).toHaveLength(TEXT_COLORS.length + HIGHLIGHT_COLORS.length + 1)
    expect(items).toContain('color-clear')
  })
})
