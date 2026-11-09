import type { StudyStats } from '@/api/types'
import { formatMinutes, growthStage } from '@/lib/studyLog'
import { cn } from '@/lib/utils'
import { cardClass } from './cardClass'
import SproutIllustration from './SproutIllustration'

// 가장 보고 싶은 값은 현재 연속 하나다. 나머지 셋은 보조 지표로 한 단계 낮춰 보여준다.
export default function StudyStatsBar({ stats }: { stats: StudyStats }) {
  const secondary = [
    { label: '최장 연속', value: `${stats.longestStreak}일` },
    { label: '이번 달 작성', value: `${stats.monthWrittenDays}일` },
    { label: '오늘 공부 시간', value: formatMinutes(stats.todayMinutes) },
  ]
  const growth = growthStage(stats.currentStreak)
  const stageLabel = `새싹 ${growth.stage + 1}단계 ${growth.name}`
  const label = stats.currentStreak > 0 ? `${stageLabel}, 연속 ${stats.currentStreak}일` : stageLabel
  const hint =
    growth.nextName === null || growth.daysToNext === null
      ? '활짝 피었어요'
      : `${growth.daysToNext}일 더 쓰면 ${growth.nextName} 단계예요`

  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div className={cn(cardClass, 'col-span-3 flex items-center gap-4 md:col-span-1')}>
        <SproutIllustration stage={growth.stage} label={label} className="h-16 w-16 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-ink-600">현재 연속</p>
          {stats.currentStreak > 0 ? (
            <>
              <p className="mt-1 text-4xl font-bold tabular-nums text-brand-700">{stats.currentStreak}일</p>
              <p className="mt-0.5 text-sm font-semibold text-ink-900">{growth.name}</p>
              <p className="text-xs text-ink-600">{hint}</p>
            </>
          ) : (
            <p className="mt-2 text-base font-semibold text-ink-900">오늘 기록하면 새싹이 돋아요</p>
          )}
        </div>
      </div>
      {secondary.map(({ label, value }) => (
        <div key={label} className={cardClass}>
          <p className="text-xs text-ink-600">{label}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-ink-900">{value}</p>
        </div>
      ))}
    </div>
  )
}
