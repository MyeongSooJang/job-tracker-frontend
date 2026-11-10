import { $command, $markSchema, $remark } from '@milkdown/kit/utils'
import { remarkStringifyOptionsCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import { TextSelection } from '@milkdown/kit/prose/state'

// 마크다운에는 색 문법이 없으므로 <span style="color:#rrggbb;background-color:#rrggbb">…</span> 로 저장한다.
// 허용하는 값은 #rrggbb 색뿐이다. 그 밖의 style 은 색 마크로 읽지 않고 그대로(원시 HTML) 둔다.
const HEX = /^#[0-9a-fA-F]{6}$/
const OPEN_TAG = /^<span style="([^"]*)">$/
const CLOSE_TAG = '</span>'

export interface TextColorAttrs {
  color: string | null
  background: string | null
}

export function parseSpanStyle(style: string): TextColorAttrs | null {
  const attrs: TextColorAttrs = { color: null, background: null }
  for (const declaration of style.split(';')) {
    if (declaration.trim() === '') continue
    const [property, value] = declaration.split(':').map(part => part.trim())
    if (property === 'color' && HEX.test(value ?? '')) attrs.color = value.toLowerCase()
    else if (property === 'background-color' && HEX.test(value ?? '')) attrs.background = value.toLowerCase()
    else return null
  }
  return attrs.color === null && attrs.background === null ? null : attrs
}

export function toSpanStyle({ color, background }: TextColorAttrs): string {
  return [color && `color:${color}`, background && `background-color:${background}`].filter(Boolean).join(';')
}

interface MdNode {
  type: string
  value?: string
  children?: MdNode[]
  color?: string | null
  background?: string | null
}

// 같은 부모 안에서 여는 <span style> 과 짝이 맞는 </span> 사이를 하나의 textColor 노드로 묶는다.
export function groupColorSpans(children: MdNode[]): MdNode[] {
  const result: MdNode[] = []
  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    const attrs = node.type === 'html' ? parseOpenTag(node.value) : null
    const closeAt = attrs ? findClose(children, i) : -1
    if (attrs && closeAt !== -1) {
      result.push({ type: 'textColor', ...attrs, children: groupColorSpans(children.slice(i + 1, closeAt)) })
      i = closeAt
    } else {
      result.push(node)
    }
  }
  return result
}

function parseOpenTag(value: string | undefined): TextColorAttrs | null {
  const match = value === undefined ? null : OPEN_TAG.exec(value)
  return match ? parseSpanStyle(match[1]) : null
}

function findClose(children: MdNode[], openAt: number): number {
  let depth = 0
  for (let i = openAt + 1; i < children.length; i++) {
    const { type, value = '' } = children[i]
    if (type !== 'html') continue
    if (value.startsWith('<span')) depth++
    else if (value === CLOSE_TAG) {
      if (depth === 0) return i
      depth--
    }
  }
  return -1
}

function walk(node: MdNode): void {
  if (!node.children) return
  node.children.forEach(walk)
  node.children = groupColorSpans(node.children)
}

const remarkTextColor = $remark('remarkTextColor', () => () => (tree: unknown) => walk(tree as MdNode))

// textColor 노드를 마크다운으로 되돌릴 때 span 태그로 감싼다.
const stringifyTextColor = (ctx: Ctx) => {
  ctx.update(remarkStringifyOptionsCtx, options => ({
    ...options,
    handlers: {
      ...options.handlers,
      textColor: (node: MdNode, _parent: unknown, state: { containerPhrasing: (n: unknown, info: unknown) => string }, info: unknown) =>
        `<span style="${toSpanStyle({ color: node.color ?? null, background: node.background ?? null })}">${state.containerPhrasing(node, info)}</span>`,
    },
  }))
}

export const textColorSchema = $markSchema('textColor', () => ({
  attrs: { color: { default: null }, background: { default: null } },
  parseDOM: [
    {
      tag: 'span[style]',
      getAttrs: (dom: HTMLElement) => parseSpanStyle(dom.getAttribute('style') ?? ''),
    },
  ],
  toDOM: mark => ['span', { style: toSpanStyle(mark.attrs as TextColorAttrs) }, 0],
  parseMarkdown: {
    match: node => node.type === 'textColor',
    runner: (state, node, markType) => {
      state.openMark(markType, { color: node.color ?? null, background: node.background ?? null })
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: mark => mark.type.name === 'textColor',
    runner: (state, mark) => {
      state.withMark(mark, 'textColor', undefined, { color: mark.attrs.color, background: mark.attrs.background })
    },
  },
}))

// 선택한 글에 색을 입힌다. 넘기지 않은 쪽(글자색/배경색)은 기존 값을 유지하고, null 을 넘기면 지운다.
export const setTextColorCommand = $command('SetTextColor', ctx => (payload?: Partial<TextColorAttrs>) => (state, dispatch) => {
  const { from, to, empty, $from } = state.selection
  if (empty || !(state.selection instanceof TextSelection)) return false
  const markType = textColorSchema.type(ctx)
  const current = $from.marks().find(mark => mark.type === markType)
  const next: TextColorAttrs = {
    color: payload && 'color' in payload ? payload.color ?? null : current?.attrs.color ?? null,
    background: payload && 'background' in payload ? payload.background ?? null : current?.attrs.background ?? null,
  }
  if (dispatch) {
    const tr = state.tr.removeMark(from, to, markType)
    if (next.color !== null || next.background !== null) tr.addMark(from, to, markType.create(next))
    dispatch(tr.scrollIntoView())
  }
  return true
})

export const textColorPlugins = [remarkTextColor, textColorSchema, setTextColorCommand].flat()
export { stringifyTextColor }
