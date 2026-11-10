import type { Ctx } from '@milkdown/kit/ctx'
import { openColorPalette } from './colorPalette'

// 글자 위에 밑줄이 그어진 "A" 모양. 누르면 색 팔레트가 열린다.
const ICON =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 4 7 15h2.2l1-2.5h3.6l1 2.5H17L12 4Zm-1 6.7L12 8l1 2.7h-2Z" fill="currentColor"/><rect x="5" y="18" width="14" height="2.5" rx="1" fill="#dc2626"/></svg>'

interface ToolbarGroupBuilder {
  addGroup: (key: string, label: string) => {
    addItem: (key: string, item: { icon: string; label?: string; active: () => boolean; onRun?: (ctx: Ctx) => void }) => unknown
  }
}

export function buildColorToolbar(builder: ToolbarGroupBuilder) {
  builder.addGroup('color', '색').addItem('color-palette', {
    icon: ICON,
    label: '색',
    active: () => false,
    onRun: openColorPalette,
  })
}
