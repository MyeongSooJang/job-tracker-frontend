import type { ApplicationStatus, CompanyReview } from '@/api/types'
import RatingStars from '@/components/reviews/RatingStars'
import DifficultyMeter from '@/components/reviews/DifficultyMeter'
import { ATMOSPHERE_LABELS, ROUTE_LABELS } from '@/lib/review'
import { STATUS_LABELS } from '@/lib/status'
import { cn } from '@/lib/utils'

interface ReviewCardProps {
  review: CompanyReview
}

// 전형 결과가 카드에서 가장 먼저 읽히도록 상태별로 색을 달리한다.
const STAGE_TONE: Record<ApplicationStatus, string> = {
  ACCEPTED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  INTERVIEW: 'bg-brand-50 text-brand-600',
  RESUME_SUBMITTED: 'bg-surface text-ink-600',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-600">
      {children}
    </span>
  )
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const questions = review.questions ?? []

  return (
    <article className="space-y-4 rounded-xl border border-line bg-white p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
              STAGE_TONE[review.stage],
            )}
          >
            {STATUS_LABELS[review.stage]}
          </span>
          <span className="text-sm font-medium text-ink-900">{review.position}</span>
        </div>
        <time className="text-xs text-ink-400" dateTime={review.createdAt}>
          {formatDate(review.createdAt)}
        </time>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <RatingStars value={review.rating} />
          <span className="text-xs text-ink-400">면접 경험</span>
        </div>
        {review.difficulty ? <DifficultyMeter value={review.difficulty} /> : null}
        {review.atmosphere ? <Chip>분위기 {ATMOSPHERE_LABELS[review.atmosphere]}</Chip> : null}
        {review.route ? <Chip>{ROUTE_LABELS[review.route]}</Chip> : null}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-600">{review.content}</p>

      {questions.length > 0 && (
        <details className="rounded-lg bg-surface px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-ink-900">
            받은 질문 {questions.length}개
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-600">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}
