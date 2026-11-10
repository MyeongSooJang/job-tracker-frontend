import { afterEach, describe, it, expect } from 'vitest'
import { Editor, defaultValueCtx, rootCtx, editorViewCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { getMarkdown } from '@milkdown/kit/utils'
import { TextSelection } from '@milkdown/kit/prose/state'
import { closeColorPalette, openColorPalette } from '../colorPalette'
import { stringifyTextColor, textColorPlugins } from '../textColor'

async function editorWithSelection(markdown: string, from: number, to: number) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const editor = await Editor.make()
    .config(ctx => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, markdown)
    })
    .config(stringifyTextColor)
    .use(commonmark)
    .use(textColorPlugins)
    .create()
  editor.action(ctx => {
    const view = ctx.get(editorViewCtx)
    // jsdom에는 레이아웃이 없어 좌표 계산을 대신한다.
    view.coordsAtPos = () => ({ left: 20, right: 20, top: 10, bottom: 30 })
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to)))
  })
  return editor
}

const palette = () => document.querySelector<HTMLElement>('.study-color-palette')
const swatch = (label: string) => document.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!

afterEach(() => {
  closeColorPalette()
  document.body.innerHTML = ''
})

describe('색 팔레트', () => {
  it('글자색 버튼을 누르면 선택한 글에 색을 입히고 팔레트를 닫는다', async () => {
    const editor = await editorWithSelection('색칠할 글\n', 1, 4)
    editor.action(openColorPalette)

    expect(palette()).not.toBeNull()
    swatch('글자색 빨강').click()

    expect(editor.action(getMarkdown())).toBe('<span style="color:#dc2626">색칠할</span> 글\n')
    expect(palette()).toBeNull()
  })

  it('배경색을 고르면 기존 글자색을 유지한 채 배경만 더한다', async () => {
    const editor = await editorWithSelection('<span style="color:#dc2626">빨강</span>\n', 1, 3)
    editor.action(openColorPalette)
    swatch('배경색 노랑').click()

    expect(editor.action(getMarkdown())).toBe('<span style="color:#dc2626;background-color:#fef08a">빨강</span>\n')
  })

  it('글자색 기본을 고르면 글자색만 지우고 배경은 남긴다', async () => {
    const editor = await editorWithSelection('<span style="color:#dc2626;background-color:#fef08a">빨강</span>\n', 1, 3)
    editor.action(openColorPalette)
    swatch('글자색 기본').click()

    expect(editor.action(getMarkdown())).toBe('<span style="background-color:#fef08a">빨강</span>\n')
  })

  it('A 버튼을 다시 누르거나 Escape 를 누르면 닫힌다', async () => {
    const editor = await editorWithSelection('글\n', 1, 2)
    editor.action(openColorPalette)
    editor.action(openColorPalette)
    expect(palette()).toBeNull()

    editor.action(openColorPalette)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(palette()).toBeNull()
  })
})
