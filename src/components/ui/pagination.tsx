import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const buttonBase =
  'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40'

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="페이지 이동" className="flex items-center justify-center gap-1">
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(buttonBase, 'text-ink-600 hover:bg-surface')}
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map(n => (
        <button
          key={n}
          type="button"
          aria-label={`${n}페이지`}
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onChange(n)}
          className={cn(
            buttonBase,
            n === page ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-surface',
          )}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        aria-label="다음 페이지"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(buttonBase, 'text-ink-600 hover:bg-surface')}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
