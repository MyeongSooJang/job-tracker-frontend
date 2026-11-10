import { describe, it, expect } from 'vitest'
import { Editor, defaultValueCtx, rootCtx, commandsCtx, editorViewCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { getMarkdown } from '@milkdown/kit/utils'
import { TextSelection } from '@milkdown/kit/prose/state'
import { groupColorSpans, parseSpanStyle, setTextColorCommand, stringifyTextColor, textColorPlugins, toSpanStyle } from '../textColor'

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

describe('parseSpanStyle / toSpanStyle', () => {
  it('글자색과 배경색을 읽고 같은 모양으로 되돌린다', () => {
    const attrs = parseSpanStyle('color:#DC2626;background-color:#fef08a')
    expect(attrs).toEqual({ color: '#dc2626', background: '#fef08a' })
    expect(toSpanStyle(attrs!)).toBe('color:#dc2626;background-color:#fef08a')
  })

  it('허용하지 않은 속성이나 색 값은 색 마크로 읽지 않는다', () => {
    expect(parseSpanStyle('color:red')).toBeNull()
    expect(parseSpanStyle('color:#dc2626;position:fixed')).toBeNull()
    expect(parseSpanStyle('')).toBeNull()
  })
})

describe('groupColorSpans', () => {
  const open = (style: string) => ({ type: 'html', value: `<span style="${style}">` })
  const close = { type: 'html', value: '</span>' }
  const text = (value: string) => ({ type: 'text', value })

  it('짝이 맞는 span 사이를 textColor 노드로 묶는다', () => {
    const result = groupColorSpans([text('a'), open('color:#dc2626'), text('b'), close, text('c')])
    expect(result).toEqual([
      text('a'),
      { type: 'textColor', color: '#dc2626', background: null, children: [text('b')] },
      text('c'),
    ])
  })

  it('닫는 태그가 없으면 원시 HTML 그대로 둔다', () => {
    const nodes = [open('color:#dc2626'), text('b')]
    expect(groupColorSpans(nodes)).toEqual(nodes)
  })
})

describe('색 마크 저장과 불러오기', () => {
  it('span 으로 저장된 색을 읽고 같은 마크다운으로 다시 저장한다', async () => {
    const markdown = '앞 <span style="color:#dc2626">빨강</span> 뒤\n'
    const editor = await createEditor(markdown)
    expect(editor.action(getMarkdown())).toBe(markdown)
  })

  it('굵게와 함께 쓴 색도 유지하고, 저장 뒤 다시 읽어도 같은 결과가 나온다', async () => {
    const first = (await createEditor('<span style="color:#2563eb">**파랑 굵게**</span>\n')).action(getMarkdown())
    expect(first).toBe('**<span style="color:#2563eb">파랑 굵게</span>**\n')
    expect((await createEditor(first)).action(getMarkdown())).toBe(first)
  })

  it('선택한 글에 색을 입히면 마크다운에 span 이 들어간다', async () => {
    const editor = await createEditor('색칠할 글\n')
    editor.action(ctx => {
      const view = ctx.get(editorViewCtx)
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 1, 4)))
      ctx.get(commandsCtx).call(setTextColorCommand.key, { color: '#16a34a' })
    })
    expect(editor.action(getMarkdown())).toBe('<span style="color:#16a34a">색칠할</span> 글\n')
  })

  it('색을 null 로 지우면 span 이 사라진다', async () => {
    const editor = await createEditor('<span style="color:#dc2626">빨강</span>\n')
    editor.action(ctx => {
      const view = ctx.get(editorViewCtx)
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 1, 3)))
      ctx.get(commandsCtx).call(setTextColorCommand.key, { color: null, background: null })
    })
    expect(editor.action(getMarkdown())).toBe('빨강\n')
  })
})
