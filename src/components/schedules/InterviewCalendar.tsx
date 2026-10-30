import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Schedule } from '@/api/types'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })

// 면접(type === 'INTERVIEW') 일정만 월간 달력에 표시한다.
export default function InterviewCalendar({ schedules }: { schedules: Schedule[] }) {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const byDate = new Map<string, Schedule[]>()
  schedules
    .filter(s => s.type === 'INTERVIEW')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .forEach(s => {
      const key = dateKey(new Date(s.scheduledAt))
      byDate.set(key, [...(byDate.get(key) ?? []), s])
    })

  const firstWeekday = month.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const todayKey = dateKey(new Date())
  const move = (delta: number) => setMonth(m => new Date(m.getFullYear(), m.getMonth() + delta, 1))

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-slate-700">면접 일정 달력</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" aria-label="이전 달" onClick={() => move(-1)}>
            ◀
          </Button>
          <span className="w-24 text-center text-sm font-medium tabular-nums">
            {month.getFullYear()}년 {month.getMonth() + 1}월
          </span>
          <Button variant="outline" size="sm" aria-label="다음 달" onClick={() => move(1)}>
            ▶
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 border-l border-t border-slate-100 text-xs">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`border-b border-r border-slate-100 py-1 text-center font-medium ${
                i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'
              }`}
            >
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            const items = d ? byDate.get(dateKey(d)) ?? [] : []
            return (
              <div key={i} className="min-h-20 border-b border-r border-slate-100 p-1">
                {d && (
                  <>
                    <span
                      className={`inline-block rounded-full px-1.5 tabular-nums ${
                        dateKey(d) === todayKey ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    {items.map(s => (
                      <Link
                        key={s.id}
                        to={`/applications/${s.application.id}`}
                        title={`${s.title}${s.address ? ` · ${s.address}` : ''}`}
                        className="mt-1 block truncate rounded bg-blue-50 px-1 py-0.5 text-blue-700 hover:bg-blue-100"
                      >
                        {timeLabel(s.scheduledAt)} {s.application.company.name}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
