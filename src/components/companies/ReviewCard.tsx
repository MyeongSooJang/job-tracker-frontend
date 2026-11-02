import type { CompanyReview } from '@/api/types'
import RatingStars from '@/components/reviews/RatingStars'
import { STATUS_LABELS } from '@/lib/status'

interface ReviewCardProps {
  review: CompanyReview
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="space-y-3 rounded-xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <RatingStars value={review.rating} />
          <span className="text-sm font-medium text-ink-900">
            {review.position} · {STATUS_LABELS[review.stage]}
          </span>
        </div>
        <time className="text-xs text-ink-400" dateTime={review.createdAt}>
          {formatDate(review.createdAt)}
        </time>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-600">{review.content}</p>
    </article>
  )
}
