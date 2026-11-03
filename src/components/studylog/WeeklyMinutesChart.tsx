import type { DailyStudyMinutes } from '@/api/types'
import { formatDateLabel, formatMinutes, weekdayLabel } from '@/lib/studyLog'

const CHART_HEIGHT_PX = 96

// 최근 7일 공부 시간 막대 그래프. 단일 계열이라 색은 브랜드색 하나만 쓰고 범례는 두지 않는다.
// 값 라벨은 가장 많이 공부한 날에만 붙이고, 나머지는 호버 툴팁과 표(스크린리더용)로 확인한다.
export default function WeeklyMinutesChart({ data }: { data: DailyStudyMinutes[] }) {
  const max = Math.max(0, ...data.map(d => d.minutes))
  const total = data.reduce((sum, d) => sum + d.minutes, 0)

  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-xs text-ink-600">
        최근 7일 공부 시간 · 합계 <span className="font-medium text-ink-900">{formatMinutes(total)}</span>
      </figcaption>
      <div
        role="img"
        aria-label={`최근 7일 공부 시간 합계 ${formatMinutes(total)}`}
        className="flex items-end gap-2 border-b border-line"
        style={{ height: CHART_HEIGHT_PX + 24 }}
      >
        {data.map(({ date, minutes }) => {
          const barHeight = minutes === 0 ? 2 : Math.max(4, Math.round((minutes / max) * CHART_HEIGHT_PX))
          const isMax = max > 0 && minutes === max
          return (
            <div key={date} className="group relative flex h-full flex-1 flex-col items-center justify-end">
              <span className="pointer-events-none absolute -top-1 z-10 hidden -translate-y-full whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-xs text-white group-hover:block">
                {formatDateLabel(date)} · {formatMinutes(minutes)}
              </span>
              {isMax && <span className="mb-1 text-[11px] font-medium text-ink-900">{formatMinutes(minutes)}</span>}
              <div
                data-testid="chart-bar"
                className={minutes === 0 ? 'w-full max-w-6 bg-line' : 'w-full max-w-6 rounded-t-[4px] bg-brand-500 group-hover:bg-brand-600'}
                style={{ height: barHeight }}
              />
              <span className="mt-1 h-5 text-[11px] text-ink-600">{weekdayLabel(date)}</span>
            </div>
          )
        })}
      </div>
      <table className="sr-only">
        <caption>최근 7일 공부 시간</caption>
        <thead>
          <tr><th>날짜</th><th>공부 시간</th></tr>
        </thead>
        <tbody>
          {data.map(({ date, minutes }) => (
            <tr key={date}><td>{formatDateLabel(date)}</td><td>{formatMinutes(minutes)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
