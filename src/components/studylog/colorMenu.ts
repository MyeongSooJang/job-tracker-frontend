import { commandsCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import { clearTextInCurrentBlockCommand } from '@milkdown/kit/preset/commonmark'
import { HIGHLIGHT_COLORS, TEXT_COLORS } from './colorPalette'
import { continueWithColorCommand, type TextColorAttrs } from './textColor'

// "+" 버튼과 "/" 메뉴에 붙는 색 항목. 고르면 그 자리에서 이어서 쓰는 글이 해당 색이 된다.
const dot = (fill: string, ring: boolean) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="${ring ? 6 : 8}" fill="${ring ? 'none' : fill}" stroke="${ring ? fill : 'rgba(0,0,0,.25)'}" stroke-width="${ring ? 3 : 1}"/></svg>`
const reset = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" fill="none"/></svg>'

const run = (ctx: Ctx, payload: Partial<TextColorAttrs>) => {
  const commands = ctx.get(commandsCtx)
  // 메뉴를 연 "/" 글자를 지운 뒤 색을 정한다.
  commands.call(clearTextInCurrentBlockCommand.key)
  commands.call(continueWithColorCommand.key, payload)
}

interface MenuGroupBuilder {
  addGroup: (key: string, label: string) => {
    addItem: (key: string, item: { label: string; icon: string; onRun?: (ctx: Ctx) => void }) => unknown
  }
}

export function buildColorMenu(builder: MenuGroupBuilder) {
  const group = builder.addGroup('color', '색')
  for (const { name, value } of TEXT_COLORS) {
    group.addItem(`text-${value}`, { label: `${name} 글자`, icon: dot(value, false), onRun: ctx => run(ctx, { color: value }) })
  }
  for (const { name, value } of HIGHLIGHT_COLORS) {
    group.addItem(`bg-${value}`, { label: `${name} 배경`, icon: dot(value, true), onRun: ctx => run(ctx, { background: value }) })
  }
  group.addItem('color-reset', { label: '기본 색', icon: reset, onRun: ctx => run(ctx, { color: null, background: null }) })
}
