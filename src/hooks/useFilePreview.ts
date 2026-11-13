import { useEffect, useState } from 'react'
import { downloadFile } from '@/api/profile'
import { loadPdf, type PdfDocument } from '@/lib/pdf'
import { getErrorMessage } from '@/lib/errors'

interface FilePreviewState {
  pdf: PdfDocument | null
  error: string | null
}

// open이 true인 동안만 파일 PDF를 받아 문서를 만들고, 닫히면 해제한다.
export function useFilePreview(open: boolean, fileId: number) {
  const [state, setState] = useState<FilePreviewState>({ pdf: null, error: null })

  useEffect(() => {
    if (!open) return
    let cancelled = false
    let loaded: PdfDocument | null = null

    downloadFile(fileId)
      .then(loadPdf)
      .then(pdf => {
        if (cancelled) {
          void pdf.destroy()
          return
        }
        loaded = pdf
        setState({ pdf, error: null })
      })
      .catch(error => {
        if (!cancelled) setState({ pdf: null, error: getErrorMessage(error, '파일을 불러오지 못했습니다.') })
      })

    return () => {
      cancelled = true
      setState({ pdf: null, error: null })
      void loaded?.destroy()
    }
  }, [open, fileId])

  return { ...state, loading: open && state.pdf === null && state.error === null }
}
