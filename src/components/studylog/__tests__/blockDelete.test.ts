import { afterEach, describe, it, expect } from 'vitest'
import { Editor, defaultValueCtx, rootCtx, editorViewCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { gfm } from '@milkdown/kit/preset/gfm'
import { $nodeSchema, getMarkdown } from '@milkdown/kit/utils'
import { blockDeletePlugin } from '../blockDelete'

// Crepe의 image-block과 같은 이름·모양(내용이 없는 최상위 atom 블록)의 테스트용 노드
const imageBlock = $nodeSchema('image-block', () => ({
  group: 'block',
  atom: true,
  attrs: { src: { default: '' } },
  toDOM: node => ['div', { class: 'milkdown-image-block' }, ['img', { src: node.attrs.src }]],
  parseDOM: [{ tag: 'div.milkdown-image-block', getAttrs: dom => ({ src: (dom as HTMLElement).querySelector('img')?.getAttribute('src') ?? '' }) }],
  parseMarkdown: { match: () => false, runner: () => undefined },
  toMarkdown: { match: node => node.type.name === 'image-block', runner: () => undefined },
}))

async function createEditor(markdown: string) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  return Editor.make()
    .config(ctx => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, markdown)
    })
    .use(commonmark)
    .use(gfm)
    .use(imageBlock)
    .use(blockDeletePlugin)
    .create()
}

const button = () => document.querySelector<HTMLButtonElement>('.study-block-delete')!
const hover = (el: Element) => el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

afterEach(() => {
  document.body.innerHTML = ''
})

describe('표·코드 블록 삭제 버튼', () => {
  it('표 위에 마우스를 올리면 삭제 버튼이 뜨고, 누르면 표만 지워진다', async () => {
    const editor = await createEditor('앞 글\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\n뒤 글\n')
    expect(button().hidden).toBe(true)

    hover(document.querySelector('td')!)
    expect(button().hidden).toBe(false)
    expect(button().getAttribute('aria-label')).toBe('표 삭제')

    button().click()

    expect(editor.action(getMarkdown())).toBe('앞 글\n\n뒤 글\n')
    expect(button().hidden).toBe(true)
  })

  it('코드 블록도 같은 방식으로 지운다', async () => {
    const editor = await createEditor('앞 글\n\n```js\nconst a = 1\n```\n\n뒤 글\n')

    hover(document.querySelector('pre')!)
    expect(button().getAttribute('aria-label')).toBe('코드 블록 삭제')
    button().click()

    expect(editor.action(getMarkdown())).toBe('앞 글\n\n뒤 글\n')
  })

  it('표만 있는 글에서 지워도 편집 가능한 빈 문서가 남는다', async () => {
    const editor = await createEditor('| a | b |\n| - | - |\n| 1 | 2 |\n')

    hover(document.querySelector('td')!)
    button().click()

    editor.action(ctx => expect(ctx.get(editorViewCtx).state.doc.childCount).toBeGreaterThan(0))
    expect(editor.action(getMarkdown())).not.toContain('|')
  })

  it('이미지 블록 위에 마우스를 올리면 삭제 버튼이 뜨고, 누르면 그 이미지만 지워진다', async () => {
    const editor = await createEditor('앞 글\n\n뒤 글\n')
    editor.action(ctx => {
      const view = ctx.get(editorViewCtx)
      const node = view.state.schema.nodes['image-block'].create({ src: '/api/images/abc' })
      view.dispatch(view.state.tr.insert(view.state.doc.child(0).nodeSize, node))
    })
    const imageCount = () => editor.action(ctx => {
      let count = 0
      ctx.get(editorViewCtx).state.doc.descendants(n => { if (n.type.name === 'image-block') count++ })
      return count
    })
    expect(imageCount()).toBe(1)

    hover(document.querySelector('.milkdown-image-block')!)
    expect(button().hidden).toBe(false)
    expect(button().getAttribute('aria-label')).toBe('이미지 삭제')
    button().click()

    expect(imageCount()).toBe(0)
    expect(editor.action(getMarkdown())).toBe('앞 글\n\n뒤 글\n')
  })

  it('표나 코드 블록이 아닌 곳에서는 버튼이 뜨지 않는다', async () => {
    await createEditor('그냥 문단\n')

    hover(document.querySelector('p')!)

    expect(button().hidden).toBe(true)
  })
})
