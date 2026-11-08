import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useReviews } from '@/hooks/useReviews'
import RatingStars from '@/components/reviews/RatingStars'
import DifficultyMeter from '@/components/reviews/DifficultyMeter'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { STATUS_LABELS } from '@/lib/status'
import { ATMOSPHERE_LABELS, STAGE_TONE, formatDate, isWritten } from '@/lib/review'
import { filterReviews } from '@/lib/reviewSearch'
import { clampPage, paginate, totalPages } from '@/lib/pagination'
import { cn } from '@/lib/utils'
import type { Review } from '@/api/types'

const PAGE_SIZE = 8

// 목록은 훑기와 찾기만 맡는다. 글은 지원 상세의 면접 메모에서 쓴다.
function ReviewRow({ review }: { review: Review }) {
  const { application } = review

  return (
    <li>
      <Link
        to={`/applications/${application.id}`}
        className="group flex items-center gap-4 rounded-xl border border-line bg-white p-4 transition-colors hover:border-brand-100 hover:bg-surface"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="truncate font-semibold text-ink-900">{application.company.name}</span>
            <span className="truncate text-sm text-ink-400">{application.position}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {isWritten(review) ? (
              <>
                <RatingStars value={review.rating ?? 0} size={14} />
                {review.difficulty ? <DifficultyMeter value={review.difficulty} /> : null}
                {review.atmosphere ? (
                  <span className="text-xs text-ink-600">분위기 {ATMOSPHERE_LABELS[review.atmosphere]}</span>
                ) : null}
              </>
            ) : (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                작성 전
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
              STAGE_TONE[application.status],
            )}
          >
            {STATUS_LABELS[application.status]}
          </span>
          <time className="text-xs text-ink-400" dateTime={review.createdAt}>
            {formatDate(review.createdAt)}
          </time>
        </div>

        <ChevronRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-ink-400 transition-colors group-hover:text-brand-600"
        />
      </Link>
    </li>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-brand-500 bg-brand-50 text-brand-600'
          : 'border-line bg-white text-ink-600 hover:bg-surface',
      )}
    >
      {children}
    </button>
  )
}

export default function Reviews() {
  const { data: reviews = [], isLoading, isError } = useReviews()
  const [query, setQuery] = useState('')
  const [unwrittenOnly, setUnwrittenOnly] = useState(false)
  const [page, setPage] = useState(1)

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const unwrittenCount = sorted.filter(r => !isWritten(r)).length
  const scoped = unwrittenOnly ? sorted.filter(r => !isWritten(r)) : sorted
  const filtered = filterReviews(scoped, query)
  const pageCount = totalPages(filtered.length, PAGE_SIZE)
  const currentPage = clampPage(page, pageCount)
  const visible = paginate(filtered, currentPage, PAGE_SIZE)

  // 검색어나 필터가 바뀌면 결과의 처음부터 보여준다.
  const handleQueryChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }
  const handleFilterChange = (onlyUnwritten: boolean) => {
    setUnwrittenOnly(onlyUnwritten)
    setPage(1)
  }

  if (isLoading) return <div className="text-ink-600">불러오는 중...</div>
  if (isError) return <div className="p-4 text-red-500">데이터를 불러오지 못했습니다.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">내 면접 기록</h1>
        <p className="mt-1 text-sm text-ink-600">
          서류합격한 지원 건은 기록이 자동으로 만들어집니다. 기록을 누르면 지원 상세에서 작성할 수 있어요.
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink-400">
          아직 면접 기록이 없습니다. 지원 건이 서류합격되면 이곳에 나타납니다.
        </p>
      ) : (
        <>
          <SearchInput
            label="면접 기록 검색"
            value={query}
            onChange={handleQueryChange}
            placeholder="회사명, 직무, 후기, 받은 질문으로 검색"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5" role="group" aria-label="보기">
              <FilterButton active={!unwrittenOnly} onClick={() => handleFilterChange(false)}>
                전체 {sorted.length}
              </FilterButton>
              <FilterButton active={unwrittenOnly} onClick={() => handleFilterChange(true)}>
                작성 전 {unwrittenCount}
              </FilterButton>
            </div>
            {filtered.length > 0 && (
              <p className="text-sm text-ink-600">
                총 <span className="font-semibold text-ink-900">{filtered.length}</span>건
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-400">
              {query.trim() !== ''
                ? `‘${query.trim()}’에 대한 검색 결과가 없습니다.`
                : '작성 전인 기록이 없습니다. 모두 작성하셨어요.'}
            </p>
          ) : (
            <>
              <ul className="space-y-2.5">
                {visible.map(r => (
                  <ReviewRow key={r.id} review={r} />
                ))}
              </ul>
              <Pagination page={currentPage} totalPages={pageCount} onChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  )
}
