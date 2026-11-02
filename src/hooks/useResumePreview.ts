import { useEffect, useState } from 'react'
import { downloadResume } from '@/api/profile'
import { loadPdf, type PdfDocument } from '@/lib/pdf'
import { getErrorMessage } from '@/lib/errors'

interface ResumePreviewState {
  pdf: PdfDocument | null
  error: string | null
}

// open이 true인 동안만 이력서 PDF를 받아 문서를 만들고, 닫히면 해제한다.
export function useResumePreview(open: boolean) {
  const [state, setState] = useState<ResumePreviewState>({ pdf: null, error: null })

  useEffect(() => {
    if (!open) return
    let cancelled = false
    let loaded: PdfDocument | null = null

    downloadResume()
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
        if (!cancelled) setState({ pdf: null, error: getErrorMessage(error, '이력서를 불러오지 못했습니다.') })
      })

    return () => {
      cancelled = true
      setState({ pdf: null, error: null })
      void loaded?.destroy()
    }
  }, [open])

  return { ...state, loading: open && state.pdf === null && state.error === null }
}
