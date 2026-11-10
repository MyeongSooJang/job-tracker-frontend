import { commandsCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import { setTextColorCommand, type TextColorAttrs } from './textColor'

// 글을 선택했을 때 뜨는 툴바에 붙이는 색 팔레트. 항목은 색 점 하나이고, 누르면 선택한 글에 바로 적용된다.
export const TEXT_COLORS = [
  { name: '빨강', value: '#dc2626' },
  { name: '주황', value: '#ea580c' },
  { name: '초록', value: '#16a34a' },
  { name: '파랑', value: '#2563eb' },
  { name: '보라', value: '#7c3aed' },
]
export const HIGHLIGHT_COLORS = [
  { name: '노랑', value: '#fef08a' },
  { name: '연두', value: '#bbf7d0' },
  { name: '하늘', value: '#bfdbfe' },
  { name: '분홍', value: '#fbcfe8' },
]

const dot = (fill: string, ring = false) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="${ring ? 6 : 8}" fill="${ring ? 'none' : fill}" stroke="${ring ? fill : 'rgba(0,0,0,.25)'}" stroke-width="${ring ? 3 : 1}"/></svg>`
const eraser = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 19 19 5M7 7l10 10" stroke="currentColor" stroke-width="2" fill="none"/></svg>'

const apply = (ctx: Ctx, payload: Partial<TextColorAttrs>) => {
  ctx.get(commandsCtx).call(setTextColorCommand.key, payload)
}

interface ToolbarGroupBuilder {
  addGroup: (key: string, label: string) => {
    addItem: (key: string, item: { icon: string; label?: string; active: () => boolean; onRun?: (ctx: Ctx) => void }) => unknown
  }
}

export function buildColorToolbar(builder: ToolbarGroupBuilder) {
  const group = builder.addGroup('color', '색')
  for (const { name, value } of TEXT_COLORS) {
    group.addItem(`color-${value}`, { icon: dot(value), label: `글자색 ${name}`, active: () => false, onRun: ctx => apply(ctx, { color: value }) })
  }
  for (const { name, value } of HIGHLIGHT_COLORS) {
    group.addItem(`bg-${value}`, { icon: dot(value, true), label: `배경색 ${name}`, active: () => false, onRun: ctx => apply(ctx, { background: value }) })
  }
  group.addItem('color-clear', { icon: eraser, label: '색 지우기', active: () => false, onRun: ctx => apply(ctx, { color: null, background: null }) })
}
