import { commandsCtx, editorViewCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import { setTextColorCommand, type TextColorAttrs } from './textColor'

// 선택 툴바의 A 버튼을 누르면 선택한 글 아래에 뜨는 색 팔레트(글자색 / 배경색).
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

const PALETTE_CLASS = 'study-color-palette'
const GAP = 8

let current: { element: HTMLElement; dispose: () => void } | null = null

export function closeColorPalette(): void {
  current?.dispose()
  current = null
}

function section(title: string, swatches: Array<{ name: string; value: string | null }>, kind: 'color' | 'background', apply: (value: string | null) => void) {
  const wrapper = document.createElement('div')
  wrapper.className = `${PALETTE_CLASS}__section`
  const heading = document.createElement('p')
  heading.className = `${PALETTE_CLASS}__title`
  heading.textContent = title
  const row = document.createElement('div')
  row.className = `${PALETTE_CLASS}__row`
  for (const { name, value } of swatches) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `${PALETTE_CLASS}__swatch`
    button.setAttribute('aria-label', `${title} ${name}`)
    button.title = name
    if (value === null) button.dataset.none = 'true'
    else if (kind === 'color') button.style.color = value
    else button.style.backgroundColor = value
    button.textContent = kind === 'color' ? '가' : ''
    button.addEventListener('click', () => apply(value))
    row.append(button)
  }
  wrapper.append(heading, row)
  return wrapper
}

export function openColorPalette(ctx: Ctx): void {
  const toggleOff = current !== null
  closeColorPalette()
  if (toggleOff) return

  const view = ctx.get(editorViewCtx)
  const apply = (payload: Partial<TextColorAttrs>) => {
    ctx.get(commandsCtx).call(setTextColorCommand.key, payload)
    closeColorPalette()
    view.focus()
  }

  const element = document.createElement('div')
  element.className = PALETTE_CLASS
  element.setAttribute('role', 'dialog')
  element.setAttribute('aria-label', '색 선택')
  element.append(
    section('글자색', [{ name: '기본', value: null }, ...TEXT_COLORS], 'color', value => apply({ color: value })),
    section('배경색', [{ name: '없음', value: null }, ...HIGHLIGHT_COLORS], 'background', value => apply({ background: value })),
  )
  // 버튼을 눌러도 에디터의 글 선택이 풀리지 않게 한다.
  element.addEventListener('mousedown', event => event.preventDefault())
  document.body.append(element)

  const { to } = view.state.selection
  const caret = view.coordsAtPos(to)
  const width = element.offsetWidth
  element.style.left = `${Math.max(GAP, Math.min(caret.left, window.innerWidth - width - GAP))}px`
  element.style.top = `${caret.bottom + GAP}px`

  const onOutside = (event: MouseEvent) => {
    if (!element.contains(event.target as Node)) closeColorPalette()
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') closeColorPalette()
  }
  // 이 클릭 자체(툴바 버튼)가 바로 닫지 않도록 다음 틱에 등록한다.
  const timer = setTimeout(() => document.addEventListener('mousedown', onOutside, true))
  document.addEventListener('keydown', onKey)
  current = {
    element,
    dispose: () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', onOutside, true)
      document.removeEventListener('keydown', onKey)
      element.remove()
    },
  }
}
