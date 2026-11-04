import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDays, buildHeatmapWeeks, heatLevel, heatmapCellLabel, heatmapMonthLabels, type HeatLevel,
} from '@/lib/studyLog'
import { cn } from '@/lib/utils'

interface HeatmapDayLike {
  date: string
  count: number
  minutes: number
}

interface StudyHeatmapProps {
  today: string
  selectedDate: string
  days: readonly HeatmapDayLike[]
  onSelect: (date: string) => void
}

const CELL_PX = 12
const GAP_PX = 3

// 글 없음(0)은 회색 테두리 칸, 1~4는 브랜드색이 진해진다. 흑백으로 봐도 단계가 구분되도록 명도 차를 둔다.
const LEVEL_CLASS: Record<HeatLevel, string> = {
  0: 'bg-surface ring-1 ring-inset ring-line',
  1: 'bg-brand-100',
  2: 'bg-brand-500/60',
  3: 'bg-brand-500',
  4: 'bg-brand-700',
}

const ARROW_STEP: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }

export default function StudyHeatmap({ today, selectedDate, days, onSelect }: StudyHeatmapProps) {
  const weeks = useMemo(() => buildHeatmapWeeks(today), [today])
  const monthLabels = useMemo(() => heatmapMonthLabels(weeks), [weeks])
  const byDate = useMemo(() => new Map(days.map(day => [day.date, day])), [days])
  const firstDate = weeks[0][0] as string
  const [focusDate, setFocusDate] = useState(today)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef(new Map<string, HTMLButtonElement>())

  // 좁은 화면에서는 가장 최근 주가 보이도록 오른쪽 끝으로 스크롤한다.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_STEP[e.key]
    if (step === undefined || e.altKey || e.ctrlKey || e.metaKey) return
    e.preventDefault()
    const next = addDays(focusDate, step)
    if (next < firstDate || next > today) return
    setFocusDate(next)
    cellRefs.current.get(next)?.focus()
  }

  return (
    <div>
      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="w-max">
          <div
            aria-hidden
            className="mb-1 grid h-4 text-[11px] text-ink-600"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, ${CELL_PX}px)`, columnGap: GAP_PX }}
          >
            {monthLabels.map(({ week, label }) => (
              <span key={week} className="whitespace-nowrap" style={{ gridColumnStart: week + 1 }}>{label}</span>
            ))}
          </div>
          <div
            role="group"
            aria-label="최근 1년 학습 잔디"
            onKeyDown={handleKeyDown}
            className="grid grid-flow-col"
            style={{ gridTemplateRows: `repeat(7, ${CELL_PX}px)`, gridAutoColumns: `${CELL_PX}px`, gap: GAP_PX }}
          >
            {weeks.flatMap((week, weekIndex) =>
              week.map((date, dayIndex) => {
                if (date === null) return <span key={`blank-${weekIndex}-${dayIndex}`} aria-hidden />
                const day = byDate.get(date)
                const label = heatmapCellLabel(date, day)
                const level = heatLevel(day?.count ?? 0, day?.minutes ?? 0)
                const isSelected = date === selectedDate
                return (
                  <button
                    key={date}
                    ref={el => {
                      if (el) cellRefs.current.set(date, el)
                      else cellRefs.current.delete(date)
                    }}
                    type="button"
                    tabIndex={date === focusDate ? 0 : -1}
                    aria-label={label}
                    title={label}
                    aria-pressed={isSelected}
                    data-level={level}
                    onClick={() => {
                      setFocusDate(date)
                      onSelect(date)
                    }}
                    onFocus={() => setFocusDate(date)}
                    className={cn(
                      'h-3 w-3 rounded-[3px] transition-colors duration-150',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
                      LEVEL_CLASS[level],
                      isSelected
                        ? 'outline outline-2 outline-offset-1 outline-ink-900'
                        : date === today && 'outline outline-1 outline-offset-1 outline-ink-600',
                    )}
                  />
                )
              }),
            )}
          </div>
        </div>
      </div>
      <div aria-hidden className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-ink-600">
        공부 시간 적게
        {([0, 1, 2, 3, 4] as const).map(level => (
          <span key={level} className={cn('h-3 w-3 rounded-[3px]', LEVEL_CLASS[level])} />
        ))}
        많이
      </div>
    </div>
  )
}
