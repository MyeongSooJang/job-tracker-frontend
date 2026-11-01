import type { Profile } from '@/api/types'
import { calcCompleteness, initialOf } from '@/lib/profile'

export default function ProfileSummaryCard({ profile }: { profile: Profile }) {
  const completeness = calcCompleteness(profile)

  return (
    <div className="rounded-xl border border-line bg-white p-4 sm:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05)] animate-fade-up motion-reduce:animate-none">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700"
        >
          {initialOf(profile.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-ink-900 sm:text-[32px] sm:leading-tight">{profile.name}</h1>
          <p className="mt-1 text-sm text-ink-600">
            {profile.desiredJob ? profile.desiredJob : '희망 직무를 입력해보세요'}
            <span className="mx-2 text-ink-400">·</span>
            {profile.email}
          </p>
        </div>
        <div className="sm:w-56">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-ink-600">프로필 완성도</span>
            <span className="font-semibold text-success">{completeness}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="프로필 완성도"
            aria-valuenow={completeness}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 overflow-hidden rounded-full bg-surface"
          >
            <div
              className="h-full rounded-full bg-success transition-[width] duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
