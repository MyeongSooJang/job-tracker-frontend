export interface PdfRender {
  done: Promise<void>
  cancel: () => void
}

// pdf.js 구현을 감추고 미리보기가 필요한 동작만 노출한다.
export interface PdfDocument {
  pageCount: number
  renderPage: (pageNumber: number, canvas: HTMLCanvasElement, targetWidth: number) => PdfRender
  destroy: () => Promise<void>
}

export async function loadPdf(blob: Blob): Promise<PdfDocument> {
  const [pdfjs, { default: workerSrc }] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) })
  const doc = await loadingTask.promise

  return {
    pageCount: doc.numPages,
    renderPage: (pageNumber, canvas, targetWidth) => {
      let task: { promise: Promise<void>; cancel: () => void } | null = null
      let cancelled = false
      const done = doc.getPage(pageNumber).then(async page => {
        if (cancelled) return
        const scale = targetWidth / page.getViewport({ scale: 1 }).width
        const viewport = page.getViewport({ scale })
        const ratio = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * ratio)
        canvas.height = Math.floor(viewport.height * ratio)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`
        const canvasContext = canvas.getContext('2d')
        if (!canvasContext) return
        task = page.render({
          canvas,
          canvasContext,
          viewport,
          transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
        })
        await task.promise
      })
      return {
        done,
        cancel: () => {
          cancelled = true
          task?.cancel()
        },
      }
    },
    destroy: () => loadingTask.destroy(),
  }
}
