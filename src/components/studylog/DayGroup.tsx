import type { StudyLog } from '@/api/types'
import { formatDayHeading, formatMinutes, summarize, type StudyDay } from '@/lib/studyLog'
import { cn } from '@/lib/utils'

interface DayGroupProps {
  day: StudyDay<StudyLog>
  today: string
  selected: boolean
  onOpen: (id: number) => void
  onWrite: (date: string) => void
}

// 한 날짜의 글 묶음. 오늘이나 사용자가 고른 날에는 그 날짜로 새 글을 시작하는 버튼을 둔다.
export default function DayGroup({ day, today, selected, onOpen, onWrite }: DayGroupProps) {
  const headingId = `day-heading-${day.date}`
  return (
    <section id={`day-${day.date}`} aria-labelledby={headingId} className="scroll-mt-4 py-4 first:pt-0 last:pb-0">
      <header className="mb-2 flex items-baseline justify-between gap-3">
        <h3 id={headingId} className={cn('text-sm font-semibold', selected ? 'text-brand-600' : 'text-ink-900')}>
          {formatDayHeading(day.date)}
          {day.date === today && (
            <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700">오늘</span>
          )}
        </h3>
        <span className="text-xs tabular-nums text-ink-600">
          {day.logs.length > 0 ? `글 ${day.logs.length}개 · ${formatMinutes(day.totalMinutes)}` : '기록 없음'}
        </span>
      </header>

      {day.logs.length > 0 && (
        <ul className="space-y-2">
          {day.logs.map(log => (
            <li key={log.id}>
              <button
                type="button"
                onClick={() => onOpen(log.id)}
                className="block w-full rounded-lg border border-line px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-ink-900">{log.title}</span>
                  <span className="shrink-0 text-xs tabular-nums text-ink-600">{formatMinutes(log.studyMinutes)}</span>
                </span>
                <span className="mt-0.5 block truncate text-sm text-ink-600">{summarize(log.content, 80)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {(day.date === today || selected) && (
        <button
          type="button"
          onClick={() => onWrite(day.date)}
          className="mt-2 w-full rounded-lg border border-dashed border-brand-100 py-2 text-sm font-medium text-brand-600 transition-colors duration-150 hover:bg-brand-50"
        >
          + 이 날짜에 새 글
        </button>
      )}
    </section>
  )
}
