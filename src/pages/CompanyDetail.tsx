import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useCompany, useCompanyReviews } from '@/hooks/useCompanies'
import CompanyAvatar from '@/components/companies/CompanyAvatar'
import ReviewCard from '@/components/companies/ReviewCard'
import RatingStars from '@/components/reviews/RatingStars'

// 평균을 믿고 비교하기에 후기가 너무 적은 경계. 넘기 전에는 참고용이라고 알린다.
const MIN_RELIABLE_REVIEWS = 5

export default function CompanyDetail() {
  const { id } = useParams()
  const companyId = Number(id)
  const { data: company, isLoading, isError } = useCompany(companyId)
  const { data: reviews = [], isLoading: reviewsLoading, isError: reviewsError } =
    useCompanyReviews(companyId)

  if (isLoading) return <div className="text-slate-500">불러오는 중...</div>
  if (isError || !company) return <div className="p-4 text-red-500">데이터를 불러오지 못했습니다.</div>

  const hasReviews = company.reviewCount > 0 && company.averageRating !== null

  return (
    <div className="space-y-8">
      <Link
        to="/companies"
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 transition-colors hover:text-brand-600"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        회사 목록
      </Link>

      <header className="flex flex-col gap-6 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CompanyAvatar name={company.name} className="h-16 w-16 text-2xl" />
          <div className="min-w-0 space-y-1.5">
            <h1 className="truncate text-2xl font-bold text-ink-900">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-600">
                {company.industry || '업종 미등록'}
              </span>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
                >
                  홈페이지
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
          {hasReviews ? (
            <>
              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-ink-400">평균 면접 경험 만족도</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-ink-900">
                    {company.averageRating!.toFixed(1)}
                  </span>
                  <span className="text-sm text-ink-400">/ 5</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 sm:items-end">
                <RatingStars value={company.averageRating!} size={18} />
                <span className="text-sm text-ink-600">후기 {company.reviewCount}개</span>
                {company.reviewCount < MIN_RELIABLE_REVIEWS && (
                  <span className="text-xs text-ink-400">후기가 적어 참고용이에요</span>
                )}
              </div>
            </>
          ) : (
            <span className="text-sm text-ink-400">아직 후기가 없어요</span>
          )}
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink-900">면접 후기</h2>
        {reviewsLoading ? (
          <p className="py-12 text-center text-sm text-ink-400">불러오는 중...</p>
        ) : reviewsError ? (
          <p className="py-12 text-center text-sm text-red-500">후기를 불러오지 못했습니다.</p>
        ) : reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line py-16 text-center text-sm text-ink-400">
            아직 등록된 후기가 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
