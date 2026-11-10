import { describe, it, expect, vi } from 'vitest'
import { buildColorToolbar } from '../colorToolbar'
import { openColorPalette } from '../colorPalette'

describe('buildColorToolbar', () => {
  it('툴바에 색 버튼 하나를 추가하고, 누르면 팔레트를 연다', () => {
    const addItem = vi.fn()
    const group = { addItem }
    addItem.mockReturnValue(group)
    const addGroup = vi.fn(() => group)

    buildColorToolbar({ addGroup })

    expect(addGroup).toHaveBeenCalledWith('color', '색')
    expect(addItem).toHaveBeenCalledTimes(1)
    expect(addItem.mock.calls[0][0]).toBe('color-palette')
    expect(addItem.mock.calls[0][1].onRun).toBe(openColorPalette)
  })
})
