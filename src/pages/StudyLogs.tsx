import { useEffect, useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useHeatmap, useStudyLogFeed, useStudyStats } from '@/hooks/useStudyLogs'
import { feedWindow, heatmapRange, monthRange, toDateKey, toMonthKey } from '@/lib/studyLog'
import { cardClass } from '@/components/studylog/cardClass'
import StudyHeatmap from '@/components/studylog/StudyHeatmap'
import StudyLogCalendar from '@/components/studylog/StudyLogCalendar'
import StudyLogFeed from '@/components/studylog/StudyLogFeed'
import StudyStatsBar from '@/components/studylog/StudyStatsBar'
import { Button } from '@/components/ui/button'

// 둘러보기 화면. 글쓰기는 /study-logs/new, /study-logs/:id 의 몰입 화면에서 한다.
export default function StudyLogs() {
  const navigate = useNavigate()
  const today = toDateKey(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [month, setMonth] = useState(toMonthKey(today))
  const [jumpTo, setJumpTo] = useState<string | null>(null)

  const stats = useStudyStats()
  const yearRange = heatmapRange(today)
  const yearHeatmap = useHeatmap(yearRange.from, yearRange.to)
  const monthBounds = monthRange(month)
  const monthHeatmap = useHeatmap(monthBounds.from, monthBounds.to)
  const feed = useStudyLogFeed(today)

  const logs = useMemo(() => feed.data?.pages.flat() ?? [], [feed.data])
  const writtenDates = useMemo(() => new Set((monthHeatmap.data ?? []).map(day => day.date)), [monthHeatmap.data])

  // 고른 날짜가 아직 불러오지 못한 오래된 구간이면, 거기까지 이어서 불러온다.
  const loadedFrom = feedWindow(today, Math.max(0, (feed.data?.pages.length ?? 1) - 1)).from
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = feed
  useEffect(() => {
    if (selectedDate < loadedFrom && hasNextPage && !isFetchingNextPage && !isFetchNextPageError) void fetchNextPage()
  }, [selectedDate, loadedFrom, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage])

  // 날짜를 고르면 목록이 그 날짜 묶음 위치로 이동한다. 첫 화면에서는 움직이지 않는다.
  useEffect(() => {
    if (jumpTo === null) return
    document.getElementById(`day-${jumpTo}`)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    setJumpTo(null)
  }, [jumpTo])

  // 다른 달의 날짜(잔디 칸 등)를 고르면 달력도 그 달로 따라간다.
  const selectDate = (date: string) => {
    setSelectedDate(date)
    setMonth(toMonthKey(date))
    setJumpTo(date)
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">학습 기록</h1>
        <Button type="button" variant="brand" onClick={() => navigate(`/study-logs/new?date=${today}`)}>
          <Pencil size={16} aria-hidden />
          오늘 기록 쓰기
        </Button>
      </div>

      {stats.data ? (
        <StudyStatsBar stats={stats.data} />
      ) : stats.isError ? (
        <p role="alert" className="text-sm text-danger">통계를 불러오지 못했습니다.</p>
      ) : (
        <div aria-hidden className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-[86px] animate-pulse rounded-xl bg-surface" />)}
        </div>
      )}

      <section aria-label="학습 잔디" className={cardClass}>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink-900">최근 1년 학습 잔디</h2>
          {yearHeatmap.data && <span className="text-xs tabular-nums text-ink-600">{yearHeatmap.data.length}일 작성</span>}
        </div>
        {yearHeatmap.isError ? (
          <p role="alert" className="text-sm text-danger">잔디를 불러오지 못했습니다.</p>
        ) : yearHeatmap.isLoading ? (
          <div aria-hidden className="h-36 animate-pulse rounded-md bg-surface" />
        ) : (
          <StudyHeatmap today={today} selectedDate={selectedDate} days={yearHeatmap.data ?? []} onSelect={selectDate} />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <StudyLogFeed
          logs={logs}
          today={today}
          selectedDate={selectedDate}
          isLoading={feed.isLoading}
          isError={feed.isError}
          hasMore={Boolean(hasNextPage)}
          isFetchingMore={isFetchingNextPage}
          onRetry={() => void feed.refetch()}
          onLoadMore={() => void fetchNextPage()}
          onOpen={id => navigate(`/study-logs/${id}`)}
          onWrite={date => navigate(`/study-logs/new?date=${date}`)}
        />
        <div className="lg:sticky lg:top-6 lg:self-start">
          <StudyLogCalendar
            month={month}
            today={today}
            selectedDate={selectedDate}
            writtenDates={writtenDates}
            onMonthChange={setMonth}
            onSelect={selectDate}
          />
        </div>
      </div>
    </div>
  )
}
