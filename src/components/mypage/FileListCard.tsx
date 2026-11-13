import { useRef, useState } from 'react'
import { Download, Eye, FileText, Trash2, UploadCloud } from 'lucide-react'
import type { FileType, UserFile } from '@/api/types'
import { downloadFile } from '@/api/profile'
import { useDeleteFile, useUploadFile } from '@/hooks/useProfile'
import { FILE_TYPES, FILE_TYPE_LABELS, getFileErrorMessage, validateFile } from '@/lib/files'
import { formatDateTime, formatFileSize } from '@/lib/profile'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import FilePreviewDialog from './FilePreviewDialog'

export default function FileListCard({ files }: { files: UserFile[] }) {
  const upload = useUploadFile()
  const remove = useDeleteFile()
  const inputRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<FileType | ''>('')
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState<UserFile | null>(null)

  const errorMessage =
    localError
    ?? (upload.error ? getFileErrorMessage(upload.error, '파일을 업로드하지 못했습니다.') : null)
    ?? (remove.error ? getFileErrorMessage(remove.error, '파일을 삭제하지 못했습니다.') : null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    upload.reset()
    remove.reset()
    if (type === '') {
      setLocalError('파일 종류를 먼저 선택해 주세요.')
      return
    }
    const invalid = validateFile(file)
    setLocalError(invalid)
    if (invalid === null) upload.mutate({ file, type })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDownload = async (file: UserFile) => {
    setLocalError(null)
    try {
      const blob = await downloadFile(file.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.fileName
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setLocalError(getFileErrorMessage(error, '파일을 내려받지 못했습니다.'))
    }
  }

  const handleDelete = (file: UserFile) => {
    if (!window.confirm(`'${file.fileName}' 파일을 삭제할까요?`)) return
    setLocalError(null)
    upload.reset()
    remove.mutate(file.id)
  }

  const busy = upload.isPending || remove.isPending

  return (
    <section
      aria-labelledby="section-files"
      className="rounded-xl border border-line bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)] animate-fade-up motion-reduce:animate-none"
    >
      <header className="mb-5">
        <h2 id="section-files" className="flex items-center gap-2 text-xl font-semibold text-ink-900">
          <FileText size={18} className="text-brand-500" aria-hidden />
          파일
        </h2>
        <p className="mt-1 text-sm text-ink-600">PDF 파일만 올릴 수 있고, 한 파일당 최대 5MB입니다. 종류를 고른 뒤 올려 주세요.</p>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        aria-label="파일 선택"
        className="hidden"
        onChange={e => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
          dragging ? 'border-brand-500 bg-brand-50' : 'border-line bg-white',
        )}
      >
        <UploadCloud size={32} className={dragging ? 'text-brand-500' : 'text-ink-400'} aria-hidden />
        <p className="text-sm text-ink-900">PDF 파일을 여기로 끌어다 놓으세요</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <select
            aria-label="파일 종류"
            value={type}
            onChange={e => setType(e.target.value as FileType | '')}
            className="h-8 rounded-lg border border-line bg-white px-2 text-sm text-ink-900"
          >
            <option value="">종류 선택</option>
            {FILE_TYPES.map(value => (
              <option key={value} value={value}>{FILE_TYPE_LABELS[value]}</option>
            ))}
          </select>
          <Button type="button" variant="brand" size="sm" onClick={() => inputRef.current?.click()} disabled={busy || type === ''}>
            {upload.isPending ? '업로드 중...' : '파일 선택'}
          </Button>
        </div>
      </div>

      {errorMessage && <p role="alert" className="mt-3 text-sm text-danger">{errorMessage}</p>}

      {files.length === 0 ? (
        <p className="mt-5 text-center text-sm text-ink-400">등록된 파일이 없습니다.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {files.map(file => (
            <li key={file.id} className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileText size={22} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2">
                    <span data-testid="file-name" className="truncate text-sm font-semibold text-ink-900">{file.fileName}</span>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {FILE_TYPE_LABELS[file.type]}
                    </span>
                  </p>
                  <p className="text-xs text-ink-400">
                    {formatFileSize(file.sizeBytes)} · {formatDateTime(file.createdAt)} 업로드
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setPreviewing(file)} disabled={busy} aria-label={`${file.fileName} 미리보기`}>
                  <Eye /> 미리보기
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDownload(file)} disabled={busy} aria-label={`${file.fileName} 내려받기`}>
                  <Download /> 내려받기
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleDelete(file)} disabled={busy} aria-label={`${file.fileName} 삭제`} className="text-danger hover:text-danger">
                  <Trash2 /> 삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {previewing && (
        <FilePreviewDialog
          open
          onOpenChange={open => { if (!open) setPreviewing(null) }}
          fileId={previewing.id}
          fileName={previewing.fileName}
        />
      )}
    </section>
  )
}
