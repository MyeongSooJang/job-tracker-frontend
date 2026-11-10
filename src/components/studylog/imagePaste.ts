import { $prose } from '@milkdown/kit/utils'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import type { EditorView } from '@milkdown/kit/prose/view'

// 이미지를 붙여넣거나(Ctrl+V) 끌어다 놓으면 올린 뒤 이미지 블록으로 넣는다.
// Crepe의 이미지 블록은 업로드 버튼과 링크 입력만 있고 붙여넣기·드래그는 처리하지 않는다.
const IMAGE_NODE = 'image-block'

export interface ImagePasteOptions {
  upload: (file: File) => Promise<string>
  onError: (error: unknown) => void
}

const imageFiles = (files: FileList | File[] | null | undefined): File[] =>
  Array.from(files ?? []).filter(file => file.type.startsWith('image/'))

// 이미지는 블록이므로 문단 안이 아니라 커서가 있는 최상위 블록 바로 뒤에 넣는다.
function blockBoundary(view: EditorView, pos: number): number {
  const $pos = view.state.doc.resolve(pos)
  return $pos.depth === 0 ? pos : $pos.after(1)
}

async function insertImages(view: EditorView, files: File[], options: ImagePasteOptions, at?: number) {
  const results = await Promise.allSettled(files.map(file => options.upload(file)))
  let position = at
  for (const result of results) {
    if (result.status === 'rejected') {
      options.onError(result.reason)
      continue
    }
    const nodeType = view.state.schema.nodes[IMAGE_NODE]
    if (!nodeType) continue
    const node = nodeType.create({ src: result.value })
    // 업로드하는 동안 문서가 바뀌었을 수 있으므로 위치는 현재 문서 크기 안으로 맞춘다.
    const pos = blockBoundary(view, position === undefined ? view.state.selection.to : Math.min(position, view.state.doc.content.size))
    view.dispatch(view.state.tr.insert(pos, node).scrollIntoView())
    position = pos + node.nodeSize
  }
}

export const createImagePastePlugin = (options: ImagePasteOptions) =>
  $prose(
    () =>
      new Plugin({
        key: new PluginKey('STUDY_IMAGE_PASTE'),
        props: {
          handlePaste: (view, event) => {
            const files = imageFiles(event.clipboardData?.files)
            if (files.length === 0) return false
            event.preventDefault()
            void insertImages(view, files, options)
            return true
          },
          handleDrop: (view, event) => {
            const files = imageFiles((event as DragEvent).dataTransfer?.files)
            if (files.length === 0) return false
            event.preventDefault()
            const dropAt = view.posAtCoords({ left: (event as DragEvent).clientX, top: (event as DragEvent).clientY })
            void insertImages(view, files, options, dropAt?.pos)
            return true
          },
        },
      }),
  )
