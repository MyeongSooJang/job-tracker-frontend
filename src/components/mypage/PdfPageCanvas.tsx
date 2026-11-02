import { useEffect, useRef } from 'react'
import type { PdfDocument } from '@/lib/pdf'

export default function PdfPageCanvas({ pdf, pageNumber }: { pdf: PdfDocument; pageNumber: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const render = pdf.renderPage(pageNumber, canvas, wrapper.clientWidth || 640)
    render.done.catch(() => {})
    return () => render.cancel()
  }, [pdf, pageNumber])

  return (
    <div ref={wrapperRef} className="w-full overflow-hidden rounded-lg border border-line bg-white">
      <canvas ref={canvasRef} role="img" aria-label={`이력서 ${pageNumber}페이지`} className="mx-auto block max-w-full" />
    </div>
  )
}
