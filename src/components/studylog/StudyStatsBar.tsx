import type { StudyStats } from '@/api/types'
import { formatMinutes } from '@/lib/studyLog'

const cardClass = 'rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]'

export default function StudyStatsBar({ stats }: { stats: StudyStats }) {
  const items = [
    { label: '현재 연속', value: `${stats.currentStreak}일` },
    { label: '최장 연속', value: `${stats.longestStreak}일` },
    { label: '이번 달 작성', value: `${stats.monthWrittenDays}일` },
    { label: '오늘 공부 시간', value: formatMinutes(stats.todayMinutes) },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(({ label, value }) => (
        <div key={label} className={cardClass}>
          <p className="text-xs text-ink-600">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink-900">{value}</p>
        </div>
      ))}
    </div>
  )
}
