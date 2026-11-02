import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clampPage } from '@/lib/pagination'
import { useResumePreview } from '@/hooks/useResumePreview'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import PdfPageCanvas from './PdfPageCanvas'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
}

export default function ResumePreviewDialog({ open, onOpenChange, fileName }: Props) {
  const { pdf, error, loading } = useResumePreview(open)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!open) setPage(1)
  }, [open])

  const pageCount = pdf?.pageCount ?? 0
  const move = (delta: number) => setPage(current => clampPage(current + delta, pageCount))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') move(-1)
    else if (e.key === 'ArrowRight') move(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{fileName}</DialogTitle>
          <DialogDescription className="sr-only">이력서 미리보기</DialogDescription>
        </DialogHeader>

        {loading && <p className="py-12 text-center text-sm text-ink-600">불러오는 중...</p>}
        {error && <p role="alert" className="py-12 text-center text-sm text-danger">{error}</p>}
        {pdf && <PdfPageCanvas pdf={pdf} pageNumber={page} />}

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => move(-1)} disabled={page <= 1} aria-label="이전 페이지">
              <ChevronLeft />
            </Button>
            <span className="text-sm text-ink-600" aria-live="polite">{page} / {pageCount}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => move(1)} disabled={page >= pageCount} aria-label="다음 페이지">
              <ChevronRight />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
