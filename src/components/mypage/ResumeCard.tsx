import { useRef, useState } from 'react'
import { Download, Eye, FileText, RefreshCw, Trash2, UploadCloud } from 'lucide-react'
import type { ResumeInfo } from '@/api/types'
import { downloadResume } from '@/api/profile'
import { useDeleteResume, useUploadResume } from '@/hooks/useProfile'
import { formatDateTime, formatFileSize, validateResumeFile } from '@/lib/profile'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import ResumePreviewDialog from './ResumePreviewDialog'

export default function ResumeCard({ resume }: { resume: ResumeInfo | null }) {
  const upload = useUploadResume()
  const remove = useDeleteResume()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const errorMessage =
    localError
    ?? (upload.error ? getErrorMessage(upload.error, '이력서를 업로드하지 못했습니다.') : null)
    ?? (remove.error ? getErrorMessage(remove.error, '이력서를 삭제하지 못했습니다.') : null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    upload.reset()
    remove.reset()
    const invalid = validateResumeFile(file)
    setLocalError(invalid)
    if (invalid === null) upload.mutate(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDownload = async () => {
    if (!resume) return
    setLocalError(null)
    try {
      const blob = await downloadResume()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = resume.fileName
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setLocalError(getErrorMessage(error, '이력서를 다운로드하지 못했습니다.'))
    }
  }

  const handleDelete = () => {
    if (!window.confirm('등록된 이력서를 삭제할까요?')) return
    setLocalError(null)
    upload.reset()
    remove.mutate()
  }

  const busy = upload.isPending || remove.isPending

  return (
    <section
      aria-labelledby="section-resume"
      className="rounded-xl border border-line bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)] animate-fade-up motion-reduce:animate-none"
    >
      <header className="mb-5">
        <h2 id="section-resume" className="flex items-center gap-2 text-xl font-semibold text-ink-900">
          <FileText size={18} className="text-brand-500" aria-hidden />
          이력서
        </h2>
        <p className="mt-1 text-sm text-ink-600">PDF 파일만 올릴 수 있고, 최대 5MB입니다. 새로 올리면 기존 파일이 교체됩니다.</p>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        aria-label="이력서 파일 선택"
        className="hidden"
        onChange={e => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {resume ? (
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FileText size={22} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{resume.fileName}</p>
              <p className="text-xs text-ink-400">
                {formatFileSize(resume.sizeBytes)} · {formatDateTime(resume.updatedAt)} 업로드
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOpen(true)} disabled={busy} aria-label="이력서 미리보기">
              <Eye /> 미리보기
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleDownload} disabled={busy} aria-label="이력서 다운로드">
              <Download /> 다운로드
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={busy} aria-label="이력서 교체">
              <RefreshCw /> 교체
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleDelete} disabled={busy} aria-label="이력서 삭제" className="text-danger hover:text-danger">
              <Trash2 /> 삭제
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
            dragging ? 'border-brand-500 bg-brand-50' : 'border-line bg-white',
          )}
        >
          <UploadCloud size={32} className={dragging ? 'text-brand-500' : 'text-ink-400'} aria-hidden />
          <p className="text-sm text-ink-900">이력서 PDF 파일을 여기로 끌어다 놓으세요</p>
          <p className="text-xs text-ink-400">PDF · 최대 5MB</p>
          <Button type="button" variant="brand" size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            {upload.isPending ? '업로드 중...' : '파일 선택'}
          </Button>
        </div>
      )}

      {resume && <ResumePreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} fileName={resume.fileName} />}

      {upload.isPending && resume && <p className="mt-3 text-sm text-ink-600">업로드 중...</p>}
      {errorMessage && <p role="alert" className="mt-3 text-sm text-danger">{errorMessage}</p>}
    </section>
  )
}
