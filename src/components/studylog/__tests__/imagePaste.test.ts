import { afterEach, describe, it, expect, vi } from 'vitest'
import { Editor, defaultValueCtx, rootCtx, editorViewCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { $nodeSchema } from '@milkdown/kit/utils'
import type { EditorView } from '@milkdown/kit/prose/view'
import { createImagePastePlugin } from '../imagePaste'

// 테스트용 최소 image-block 노드(Crepe의 실제 노드와 같은 이름과 속성).
const imageBlock = $nodeSchema('image-block', () => ({
  group: 'block',
  atom: true,
  attrs: { src: { default: '' }, caption: { default: '' }, ratio: { default: 1 } },
  toDOM: node => ['img', { src: node.attrs.src }],
  parseDOM: [{ tag: 'img' }],
  parseMarkdown: { match: () => false, runner: () => undefined },
  toMarkdown: { match: node => node.type.name === 'image-block', runner: () => undefined },
}))

async function createEditor(upload: (file: File) => Promise<string>, onError = vi.fn()) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const editor = await Editor.make()
    .config(ctx => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, '앞 글\n')
    })
    .use(commonmark)
    .use(imageBlock)
    .use(createImagePastePlugin({ upload, onError }))
    .create()
  let view!: EditorView
  editor.action(ctx => {
    view = ctx.get(editorViewCtx)
  })
  return { view, onError }
}

const png = (name = 'a.png') => new File(['x'], name, { type: 'image/png' })
const pasteEvent = (files: File[]) => ({ clipboardData: { files }, preventDefault: vi.fn() }) as unknown as ClipboardEvent
const imageSrcs = (view: EditorView) => {
  const srcs: string[] = []
  view.state.doc.descendants(node => {
    if (node.type.name === 'image-block') srcs.push(node.attrs.src)
  })
  return srcs
}
const paste = (view: EditorView, event: ClipboardEvent) =>
  view.someProp('handlePaste', handler => handler(view, event, null as never))

afterEach(() => {
  document.body.innerHTML = ''
})

describe('이미지 붙여넣기', () => {
  it('이미지를 붙여넣으면 올린 뒤 이미지 블록으로 넣는다', async () => {
    const upload = vi.fn().mockResolvedValue('/api/images/abc')
    const { view } = await createEditor(upload)
    const event = pasteEvent([png()])

    const handled = paste(view, event)

    expect(handled).toBe(true)
    expect(event.preventDefault).toHaveBeenCalled()
    await vi.waitFor(() => expect(imageSrcs(view)).toEqual(['/api/images/abc']))
    expect(upload).toHaveBeenCalledTimes(1)
  })

  it('여러 장을 붙여넣으면 모두 올려 붙여넣은 순서대로 넣는다', async () => {
    const upload = vi.fn(async (file: File) => `/api/images/${file.name}`)
    const { view } = await createEditor(upload)

    paste(view, pasteEvent([png('1.png'), png('2.png')]))

    await vi.waitFor(() => expect(imageSrcs(view)).toEqual(['/api/images/1.png', '/api/images/2.png']))
  })

  it('이미지가 아닌 붙여넣기는 건드리지 않는다', async () => {
    const upload = vi.fn()
    const { view } = await createEditor(upload)
    const event = pasteEvent([new File(['x'], 'a.txt', { type: 'text/plain' })])

    expect(paste(view, event)).toBeFalsy()
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(upload).not.toHaveBeenCalled()
  })

  it('올리기가 실패하면 알리고 이미지는 넣지 않는다', async () => {
    const failure = new Error('업로드 실패')
    const { view, onError } = await createEditor(vi.fn().mockRejectedValue(failure))

    paste(view, pasteEvent([png()]))

    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(failure))
    expect(imageSrcs(view)).toEqual([])
  })

  it('한 장이 실패해도 나머지는 넣는다', async () => {
    const upload = vi.fn(async (file: File) => {
      if (file.name === 'bad.png') throw new Error('실패')
      return `/api/images/${file.name}`
    })
    const { view, onError } = await createEditor(upload)

    paste(view, pasteEvent([png('bad.png'), png('ok.png')]))

    await vi.waitFor(() => expect(imageSrcs(view)).toEqual(['/api/images/ok.png']))
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
