import { useMemo, useState } from 'react'
import { formatMinutes } from '@/lib/studyLog'
import { monthlyBuckets, niceAxis, weeklyBuckets, type DayMinutes, type TimeBucket, type TimeRange } from '@/lib/studyTime'
import { cn } from '@/lib/utils'
import { cardClass } from './cardClass'

interface StudyTimeChartProps {
  today: string
  days: readonly DayMinutes[]
}

const RANGES: ReadonlyArray<{ value: TimeRange; label: string; subtitle: string; current: string }> = [
  { value: 'week', label: '주별', subtitle: '최근 12주', current: '이번 주' },
  { value: 'month', label: '월별', subtitle: '최근 12개월', current: '이번 달' },
]

const percent = (minutes: number, top: number) => (top === 0 ? 0 : (minutes / top) * 100)

const bucketName = (bucket: TimeBucket) => `${bucket.tooltipLabel}${bucket.inProgress ? ' (진행 중)' : ''}`

export default function StudyTimeChart({ today, days }: StudyTimeChartProps) {
  const [range, setRange] = useState<TimeRange>('week')
  const [showTable, setShowTable] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const buckets = useMemo(
    () => (range === 'week' ? weeklyBuckets(days, today) : monthlyBuckets(days, today)),
    [range, days, today],
  )
  const meta = RANGES.find(item => item.value === range) as (typeof RANGES)[number]
  const maxMinutes = Math.max(...buckets.map(bucket => bucket.minutes))
  const axis = niceAxis(maxMinutes)
  const peakIndex = buckets.findIndex(bucket => bucket.minutes === maxMinutes)
  const current = buckets[buckets.length - 1]
  const isEmpty = maxMinutes === 0

  return (
    <section aria-label="공부 시간" className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-900">공부 시간</h2>
        <div role="group" aria-label="보기 단위" className="inline-flex rounded-lg border border-line p-0.5">
          {RANGES.map(item => (
            <button
              key={item.value}
              type="button"
              aria-pressed={range === item.value}
              onClick={() => {
                setRange(item.value)
                setActiveIndex(null)
              }}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors duration-150',
                range === item.value ? 'bg-brand-500 text-white' : 'text-ink-600 hover:bg-surface',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1 flex items-baseline justify-between gap-3">
        <p className="text-xs text-ink-600">{meta.subtitle}</p>
        <p className="text-sm text-ink-600">
          <span>{meta.current}</span>{' '}
          <strong className="font-semibold text-ink-900">{formatMinutes(current.minutes)}</strong>
        </p>
      </div>

      {isEmpty ? (
        <p className="flex h-44 items-center justify-center text-sm text-ink-600">
          아직 기록한 시간이 없어요. 오늘 글을 쓰면 여기에 쌓여요.
        </p>
      ) : showTable ? (
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">{meta.subtitle} 공부 시간</caption>
          <thead>
            <tr>
              <th scope="col" className="py-1 text-left font-medium text-ink-600">기간</th>
              <th scope="col" className="py-1 text-right font-medium text-ink-600">공부 시간</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map(bucket => (
              <tr key={bucket.key} className="border-t border-line">
                <th scope="row" className="py-1.5 text-left font-normal text-ink-900">{bucketName(bucket)}</th>
                <td className="py-1.5 text-right tabular-nums text-ink-900">{formatMinutes(bucket.minutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-4 flex gap-2 pt-6">
          <div aria-hidden className="relative h-40 w-14 shrink-0">
            {axis.ticks.map(tick => (
              <span
                key={tick}
                className="absolute right-0 translate-y-1/2 text-[11px] tabular-nums text-ink-600"
                style={{ bottom: `${percent(tick, axis.top)}%` }}
              >
                {formatMinutes(tick)}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative h-40">
              {axis.ticks.map(tick => (
                <div
                  key={tick}
                  aria-hidden
                  className="absolute inset-x-0 border-t border-line"
                  style={{ bottom: `${percent(tick, axis.top)}%` }}
                />
              ))}
              <ul className="absolute inset-0 flex items-end gap-2">
                {buckets.map((bucket, index) => {
                  const height = percent(bucket.minutes, axis.top)
                  const showValue = bucket.minutes > 0 && (index === peakIndex || bucket.inProgress)
                  const align = index < 3 ? 'left-0' : index > buckets.length - 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                  return (
                    <li
                      // 같은 자리의 막대를 주별과 월별이 이어 써서 높이가 부드럽게 바뀐다
                      key={index}
                      tabIndex={0}
                      aria-label={`${bucket.tooltipLabel}, ${formatMinutes(bucket.minutes)}${bucket.inProgress ? ', 진행 중' : ''}`}
                      onPointerEnter={() => setActiveIndex(index)}
                      onPointerLeave={() => setActiveIndex(null)}
                      onFocus={() => setActiveIndex(index)}
                      onBlur={() => setActiveIndex(null)}
                      className="relative flex h-full flex-1 items-end justify-center rounded-md outline-none focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div
                        data-part="bar"
                        className={cn(
                          'w-full max-w-6 rounded-t-[4px] transition-[height] duration-300 ease-out motion-reduce:transition-none',
                          bucket.inProgress ? 'bg-brand-500/60' : 'bg-brand-500',
                        )}
                        style={{ height: `${height}%` }}
                      />
                      {showValue && (
                        <span
                          data-part="value-label"
                          aria-hidden
                          className="absolute left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-xs font-medium tabular-nums text-ink-900 sm:block"
                          style={{ bottom: `calc(${height}% + 4px)` }}
                        >
                          {formatMinutes(bucket.minutes)}
                        </span>
                      )}
                      {activeIndex === index && (
                        <div
                          aria-hidden
                          className={cn(
                            'absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg border border-line bg-white px-3 py-2 shadow-[0_2px_6px_rgba(16,24,40,0.08)]',
                            align,
                          )}
                        >
                          <p className="text-sm font-semibold tabular-nums text-ink-900">{formatMinutes(bucket.minutes)}</p>
                          <p className="text-xs text-ink-600">{bucketName(bucket)}</p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
            <ol aria-hidden className="mt-2 flex gap-2 text-[11px] text-ink-600">
              {buckets.map((bucket, index) => (
                <li key={index} className="flex-1 text-center tabular-nums">
                  {(buckets.length - 1 - index) % 2 === 0 ? bucket.label : ''}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {!isEmpty && (
        <button
          type="button"
          onClick={() => {
            setShowTable(value => !value)
            setActiveIndex(null)
          }}
          className="mt-3 text-xs font-medium text-brand-600 underline-offset-2 hover:underline"
        >
          {showTable ? '차트로 보기' : '표로 보기'}
        </button>
      )}
    </section>
  )
}
