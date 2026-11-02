import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { CompanyWithStats } from '@/api/types'
import CompanyAvatar from './CompanyAvatar'

interface CompanyCardProps {
  company: CompanyWithStats
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const hasReviews = company.reviewCount > 0 && company.averageRating !== null

  return (
    <Link
      to={`/companies/${company.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-line bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <CompanyAvatar name={company.name} />
      <div className="min-w-0 space-y-1.5">
        <h2 className="truncate text-base font-semibold text-ink-900 group-hover:text-brand-600">
          {company.name}
        </h2>
        <span className="inline-block rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-ink-600">
          {company.industry || '업종 미등록'}
        </span>
      </div>
      <div className="mt-auto flex items-center gap-1.5 border-t border-line pt-3 text-sm">
        {hasReviews ? (
          <>
            <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="font-semibold text-ink-900">{company.averageRating!.toFixed(1)}</span>
            <span className="text-ink-400">후기 {company.reviewCount}개</span>
          </>
        ) : (
          <span className="text-ink-400">아직 후기가 없어요</span>
        )}
      </div>
    </Link>
  )
}
