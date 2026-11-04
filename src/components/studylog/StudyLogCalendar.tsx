import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildMonthCells, shiftMonth } from '@/lib/studyLog'
import { cardClass } from './cardClass'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface StudyLogCalendarProps {
  month: string
  today: string
  selectedDate: string
  writtenDates: ReadonlySet<string>
  onMonthChange: (month: string) => void
  onSelect: (date: string) => void
}

// 기록이 있는 날에 점을 찍고, 오늘 이후 날짜는 기록할 수 없으므로 선택하지 못하게 막는다.
export default function StudyLogCalendar({
  month, today, selectedDate, writtenDates, onMonthChange, onSelect,
}: StudyLogCalendarProps) {
  const [year, monthNumber] = month.split('-').map(Number)

  return (
    <section
      aria-label="학습 기록 달력"
      className={cardClass}
    >
      <header className="mb-3 flex items-center justify-between">
        <Button variant="outline" size="sm" aria-label="이전 달" onClick={() => onMonthChange(shiftMonth(month, -1))}>
          ◀
        </Button>
        <span className="text-sm font-medium tabular-nums text-ink-900">{year}년 {monthNumber}월</span>
        <Button variant="outline" size="sm" aria-label="다음 달" onClick={() => onMonthChange(shiftMonth(month, 1))}>
          ▶
        </Button>
      </header>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={cn('py-1 font-medium', i === 0 ? 'text-danger' : 'text-ink-600')}>{w}</div>
        ))}
        {buildMonthCells(month).map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />
          const isSelected = date === selectedDate
          const isFuture = date > today
          const hasLog = writtenDates.has(date)
          return (
            <button
              key={date}
              type="button"
              disabled={isFuture}
              aria-pressed={isSelected}
              aria-label={`${date}${hasLog ? ' 기록 있음' : ''}`}
              onClick={() => onSelect(date)}
              className={cn(
                'relative flex h-9 flex-col items-center justify-center rounded-md text-sm tabular-nums transition-colors',
                isSelected ? 'bg-brand-500 text-white' : 'text-ink-900 hover:bg-surface',
                date === today && !isSelected && 'ring-1 ring-brand-500',
                isFuture && 'cursor-not-allowed text-ink-400 hover:bg-transparent',
              )}
            >
              {Number(date.slice(8))}
              {hasLog && (
                <span
                  aria-hidden
                  className={cn('absolute bottom-1 h-1 w-1 rounded-full', isSelected ? 'bg-white' : 'bg-brand-500')}
                />
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
