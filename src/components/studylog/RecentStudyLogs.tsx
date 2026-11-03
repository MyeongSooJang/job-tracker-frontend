import type { StudyLog } from '@/api/types'
import { cn } from '@/lib/utils'
import { formatDateLabel, formatMinutes, summarize } from '@/lib/studyLog'

interface RecentStudyLogsProps {
  logs: StudyLog[]
  selectedDate: string
  onSelect: (date: string) => void
}

export default function RecentStudyLogs({ logs, selectedDate, onSelect }: RecentStudyLogsProps) {
  return (
    <section
      aria-label="최근 학습 기록"
      className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)]"
    >
      <h2 className="mb-3 text-sm font-semibold text-ink-900">최근 글</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-ink-400">아직 작성한 기록이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-line">
          {logs.map(log => (
            <li key={log.id}>
              <button
                type="button"
                onClick={() => onSelect(log.studyDate)}
                aria-current={log.studyDate === selectedDate ? 'true' : undefined}
                className={cn(
                  'block w-full px-2 py-2.5 text-left transition-colors hover:bg-surface',
                  log.studyDate === selectedDate && 'bg-brand-50',
                )}
              >
                <span className="flex items-center justify-between text-xs text-ink-600">
                  <span>{formatDateLabel(log.studyDate)}</span>
                  <span className="tabular-nums">{formatMinutes(log.studyMinutes)}</span>
                </span>
                <span className="mt-0.5 block truncate text-sm text-ink-900">{summarize(log.content)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
