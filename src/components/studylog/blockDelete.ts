import { $prose } from '@milkdown/kit/utils'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import type { EditorView } from '@milkdown/kit/prose/view'

// 표·코드 블록·이미지 위에 마우스를 올리면 오른쪽 위에 "삭제" 버튼이 뜨고, 누르면 그 블록을 통째로 지운다.
// Crepe는 표의 행/열 삭제만 있고 표 전체나 코드 블록을 지우는 UI가 없다.
const DELETABLE: Record<string, string> = { table: '표', code_block: '코드 블록', 'image-block': '이미지' }
const TARGET_SELECTOR = 'table, .milkdown-code-block, pre, .milkdown-image-block'
const HIDE_DELAY_MS = 200
const BUTTON_CLASS = 'study-block-delete'
const TRASH_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Z" fill="currentColor"/></svg>'

interface Located {
  from: number
  nodeSize: number
  label: string
}

// 마우스 아래 요소가 속한 표/코드 블록의 문서상 위치를 찾는다.
function locate(view: EditorView, element: Element): Located | null {
  let pos: number
  try {
    pos = view.posAtDOM(element, 0)
  } catch {
    return null
  }
  const $pos = view.state.doc.resolve(pos)
  // 이미지처럼 내용이 없는 최상위 블록은 posAtDOM이 노드 바로 앞 위치를 돌려주므로(깊이 0), 그 뒤의 노드를 본다.
  const next = $pos.nodeAfter
  const nextDom = view.nodeDOM(pos)
  if (next && DELETABLE[next.type.name] && nextDom instanceof Element && (nextDom === element || nextDom.contains(element) || element.contains(nextDom))) {
    return { from: pos, nodeSize: next.nodeSize, label: DELETABLE[next.type.name] }
  }
  for (let depth = $pos.depth; depth >= 1; depth--) {
    const node = $pos.node(depth)
    const label = DELETABLE[node.type.name]
    if (label) return { from: $pos.before(depth), nodeSize: node.nodeSize, label }
  }
  return null
}

export const blockDeletePlugin = $prose(() => {
  const key = new PluginKey('STUDY_BLOCK_DELETE')
  return new Plugin({
    key,
    view: view => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = BUTTON_CLASS
      button.hidden = true
      button.innerHTML = `${TRASH_ICON}<span>삭제</span>`
      // 눌러도 에디터 선택이 풀리지 않게 한다.
      button.addEventListener('mousedown', event => event.preventDefault())
      document.body.append(button)

      let hideTimer: ReturnType<typeof setTimeout> | undefined
      let target: Element | null = null

      const hide = () => {
        clearTimeout(hideTimer)
        button.hidden = true
        target = null
      }
      const scheduleHide = () => {
        clearTimeout(hideTimer)
        hideTimer = setTimeout(hide, HIDE_DELAY_MS)
      }
      const cancelHide = () => clearTimeout(hideTimer)

      const onOver = (event: MouseEvent) => {
        const element = (event.target as Element | null)?.closest?.(TARGET_SELECTOR)
        if (!element || !view.dom.contains(element)) return
        const found = locate(view, element)
        if (!found) return
        cancelHide()
        target = element
        button.setAttribute('aria-label', `${found.label} 삭제`)
        button.title = `${found.label} 삭제`
        const rect = element.getBoundingClientRect()
        button.hidden = false
        button.style.top = `${Math.max(4, rect.top - button.offsetHeight - 4)}px`
        button.style.left = `${Math.max(4, rect.right - button.offsetWidth)}px`
      }

      const onClick = () => {
        if (!target) return
        const found = locate(view, target)
        hide()
        if (!found) return
        view.dispatch(view.state.tr.delete(found.from, found.from + found.nodeSize).scrollIntoView())
        view.focus()
      }

      view.dom.addEventListener('mouseover', onOver)
      view.dom.addEventListener('mouseleave', scheduleHide)
      button.addEventListener('mouseenter', cancelHide)
      button.addEventListener('mouseleave', scheduleHide)
      button.addEventListener('click', onClick)
      window.addEventListener('scroll', hide, true)

      return {
        destroy() {
          clearTimeout(hideTimer)
          view.dom.removeEventListener('mouseover', onOver)
          view.dom.removeEventListener('mouseleave', scheduleHide)
          window.removeEventListener('scroll', hide, true)
          button.remove()
        },
      }
    },
  })
})
