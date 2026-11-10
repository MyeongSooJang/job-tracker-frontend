import { describe, it, expect, vi } from 'vitest'
import { Editor, defaultValueCtx, rootCtx, editorViewCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { getMarkdown } from '@milkdown/kit/utils'
import { buildColorMenu } from '../colorMenu'
import { HIGHLIGHT_COLORS, TEXT_COLORS } from '../colorPalette'
import { stringifyTextColor, textColorPlugins } from '../textColor'

async function createEditor(markdown: string) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  return Editor.make()
    .config(ctx => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, markdown)
    })
    .config(stringifyTextColor)
    .use(commonmark)
    .use(textColorPlugins)
    .create()
}

type Item = { label: string; icon: string; onRun?: (ctx: never) => void }

function menuItems() {
  const items = new Map<string, Item>()
  const group = { addItem: vi.fn((key: string, item: Item) => (items.set(key, item), group)) }
  const addGroup = vi.fn(() => group)
  buildColorMenu({ addGroup } as never)
  return { items, addGroup }
}

describe('buildColorMenu', () => {
  it('색 그룹에 글자색, 배경색, 기본 색 항목을 추가한다', () => {
    const { items, addGroup } = menuItems()

    expect(addGroup).toHaveBeenCalledWith('color', '색')
    expect(items.size).toBe(TEXT_COLORS.length + HIGHLIGHT_COLORS.length + 1)
    expect([...items.values()].map(i => i.label)).toContain('빨강 글자')
    expect([...items.values()].map(i => i.label)).toContain('노랑 배경')
    expect([...items.values()].map(i => i.label)).toContain('기본 색')
  })

  it('빈 줄에서 "빨강 글자"를 고르면 이어서 쓴 글이 빨간색으로 저장된다', async () => {
    const editor = await createEditor('\n')
    const { items } = menuItems()

    editor.action(ctx => {
      items.get('text-#dc2626')!.onRun!(ctx as never)
      const view = ctx.get(editorViewCtx)
      view.dispatch(view.state.tr.insertText('안녕'))
    })

    expect(editor.action(getMarkdown())).toBe('<span style="color:#dc2626">안녕</span>\n')
  })

  it('글자색을 고른 뒤 배경을 더 고르면 둘 다 적용된다', async () => {
    const editor = await createEditor('\n')
    const { items } = menuItems()

    editor.action(ctx => {
      items.get('text-#2563eb')!.onRun!(ctx as never)
      items.get('bg-#fef08a')!.onRun!(ctx as never)
      const view = ctx.get(editorViewCtx)
      view.dispatch(view.state.tr.insertText('강조'))
    })

    expect(editor.action(getMarkdown())).toBe('<span style="color:#2563eb;background-color:#fef08a">강조</span>\n')
  })

  it('"기본 색"을 고르면 이어서 쓰는 글에서 색이 빠진다', async () => {
    const editor = await createEditor('\n')
    const { items } = menuItems()

    editor.action(ctx => {
      items.get('text-#dc2626')!.onRun!(ctx as never)
      items.get('color-reset')!.onRun!(ctx as never)
      const view = ctx.get(editorViewCtx)
      view.dispatch(view.state.tr.insertText('보통'))
    })

    expect(editor.action(getMarkdown())).toBe('보통\n')
  })
})
