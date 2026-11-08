import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildMonthCells, shiftMonth, toMonthKey } from '@/lib/studyLog'
import { cardClass } from './cardClass'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface StudyLogCalendarProps {
  month: string
  today: string
  selectedDate: string
  writtenDates: ReadonlySet<string>
  // 목록을 거를 요일(0=일~6=토). 없으면 전체.
  weekday: number | null
  onWeekdayChange: (weekday: number | null) => void
  onMonthChange: (month: string) => void
  onSelect: (date: string) => void
}

// 기록이 있는 날에 점을 찍고, 오늘 이후 날짜는 기록할 수 없으므로 선택하지 못하게 막는다.
export default function StudyLogCalendar({
  month, today, selectedDate, writtenDates, weekday, onWeekdayChange, onMonthChange, onSelect,
}: StudyLogCalendarProps) {
  const [year, monthNumber] = month.split('-').map(Number)

  return (
    <section
      aria-label="학습 기록 달력"
      className={cardClass}
    >
      <header className="mb-3 flex items-center justify-between">
        <Button variant="outline" size="sm" aria-label="이전 달" onClick={() => onMonthChange(shiftMonth(month, -1))}>
          <ChevronLeft size={16} aria-hidden />
        </Button>
        <span className="text-sm font-medium tabular-nums text-ink-900">{year}년 {monthNumber}월</span>
        <Button
          variant="outline"
          size="sm"
          aria-label="다음 달"
          disabled={month >= toMonthKey(today)}
          onClick={() => onMonthChange(shiftMonth(month, 1))}
        >
          <ChevronRight size={16} aria-hidden />
        </Button>
      </header>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((w, i) => (
          <button
            key={w}
            type="button"
            aria-pressed={weekday === i}
            aria-label={`${w}요일만 보기`}
            onClick={() => onWeekdayChange(weekday === i ? null : i)}
            className={cn(
              'rounded-md py-1 font-medium transition-colors',
              weekday === i ? 'bg-brand-50 text-brand-700' : cn('hover:bg-surface', i === 0 ? 'text-danger' : 'text-ink-600'),
            )}
          >
            {w}
          </button>
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
              aria-label={`${year}년 ${monthNumber}월 ${Number(date.slice(8))}일${date === today ? ' (오늘)' : ''}${hasLog ? ' 기록 있음' : ''}`}
              onClick={() => onSelect(date)}
              className={cn(
                'relative flex h-10 flex-col items-center justify-center rounded-md text-sm tabular-nums transition-colors',
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
