import type { StudyStats } from '@/api/types'
import WeeklyMinutesChart from './WeeklyMinutesChart'

const cardClass = 'rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]'

export default function StudyStatsBar({ stats }: { stats: StudyStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-[180px_180px_1fr]">
      <div className={cardClass}>
        <p className="text-xs text-ink-600">연속 작성일</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-ink-900">{stats.currentStreak}일</p>
      </div>
      <div className={cardClass}>
        <p className="text-xs text-ink-600">이번 달 작성</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-ink-900">{stats.monthWrittenDays}일</p>
      </div>
      <div className={cardClass}>
        <WeeklyMinutesChart data={stats.last7Days} />
      </div>
    </div>
  )
}
