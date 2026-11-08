import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReviews } from '@/hooks/useReviews'
import ReviewForm from '@/components/reviews/ReviewForm'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { STATUS_LABELS } from '@/lib/status'
import { STAGE_TONE } from '@/lib/review'
import { filterReviews } from '@/lib/reviewSearch'
import { clampPage, paginate, totalPages } from '@/lib/pagination'
import { cn } from '@/lib/utils'
import type { Review } from '@/api/types'

function MyReviewCard({ review }: { review: Review }) {
  const company = review.application.company.name

  return (
    <article className="space-y-5 rounded-xl border border-line bg-white p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <Link
            to={`/applications/${review.application.id}`}
            className="truncate text-base font-semibold text-ink-900 hover:underline"
          >
            {company}
          </Link>
          <span className="truncate text-sm text-ink-400">{review.application.position}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
              STAGE_TONE[review.application.status],
            )}
          >
            {STATUS_LABELS[review.application.status]}
          </span>
          {!review.content && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              작성 전
            </span>
          )}
        </div>
      </header>

      <ReviewForm
        review={review}
        subject={company}
        contentLabel={`${company} 후기`}
        contentPlaceholder="면접 분위기, 아쉬운 점, 다음 지원자에게 해주고 싶은 말을 남겨 보세요."
        saveLabel="저장"
      />
    </article>
  )
}

// 카드마다 입력 폼이 펼쳐져 있어 길기 때문에 한 페이지에 두 건만 보여준다.
const PAGE_SIZE = 2

export default function Reviews() {
  const { data: reviews = [], isLoading, isError } = useReviews()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const filtered = filterReviews(sorted, query)
  const pageCount = totalPages(filtered.length, PAGE_SIZE)
  const currentPage = clampPage(page, pageCount)
  const visible = paginate(filtered, currentPage, PAGE_SIZE)

  // 검색어가 바뀌면 결과의 처음부터 보여준다.
  const handleQueryChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  if (isLoading) return <div className="text-ink-600">불러오는 중...</div>
  if (isError) return <div className="p-4 text-red-500">데이터를 불러오지 못했습니다.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">내 면접 기록</h1>
        <p className="mt-1 text-sm text-ink-600">
          서류합격한 지원 건은 기록이 자동으로 만들어집니다.
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

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-400">
              &lsquo;{query.trim()}&rsquo;에 대한 검색 결과가 없습니다.
            </p>
          ) : (
            <>
              <p className="text-sm text-ink-600">
                총 <span className="font-semibold text-ink-900">{filtered.length}</span>건
              </p>
              <div className="space-y-4">
                {visible.map(r => (
                  <MyReviewCard key={r.id} review={r} />
                ))}
              </div>
              <Pagination page={currentPage} totalPages={pageCount} onChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  )
}
