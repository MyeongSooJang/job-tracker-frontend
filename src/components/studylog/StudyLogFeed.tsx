import { useState } from 'react'
import type { StudyLog } from '@/api/types'
import { groupByDate, weekdayIndex } from '@/lib/studyLog'
import { Button } from '@/components/ui/button'
import DayGroup from './DayGroup'
import { cn } from '@/lib/utils'
import { cardClass } from './cardClass'

interface StudyLogFeedProps {
  logs: StudyLog[]
  today: string
  selectedDate: string
  // 요일(0=일~6=토)로 거르는 중이면 그 요일의 날짜만 보여준다.
  weekday: number | null
  isLoading: boolean
  isError: boolean
  hasMore: boolean
  isFetchingMore: boolean
  onRetry: () => void
  onLoadMore: () => void
  onOpen: (id: number) => void
  onWrite: (date: string) => void
}

const WEEKDAY_PAGE_SIZE = 3
const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

// 날짜별로 묶은 글 목록. 오늘과 고른 날은 글이 없어도 묶음을 보여 새 글을 바로 시작할 수 있게 한다.
export default function StudyLogFeed({
  logs, today, selectedDate, weekday, isLoading, isError, hasMore, isFetchingMore, onRetry, onLoadMore, onOpen, onWrite,
}: StudyLogFeedProps) {
  const [visibleCount, setVisibleCount] = useState(WEEKDAY_PAGE_SIZE)
  // 요일로 거를 때는 글이 있는 날짜만 남기고, 한 번에 3일씩 펼친다. (요일이 바뀌면 부모가 key로 새로 마운트한다.)
  const allDays = weekday === null
    ? groupByDate(logs, [today, selectedDate])
    : groupByDate(logs.filter(item => weekdayIndex(item.studyDate) === weekday), [])
  const days = weekday === null ? allDays : allDays.slice(0, visibleCount)
  const hiddenDays = allDays.length - days.length

  return (
    <section
      aria-label="학습 기록 목록"
      className={cn(cardClass, 'min-w-0 sm:p-5')}
    >
      <h2 className="sr-only">날짜별 학습 기록</h2>
      {isLoading ? (
        <div role="status" aria-label="기록 불러오는 중" className="space-y-3">
          {[0, 1, 2].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />)}
        </div>
      ) : isError ? (
        <div role="alert" className="flex items-center justify-between gap-3 text-sm text-danger">
          <span>기록을 불러오지 못했습니다.</span>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>다시 시도</Button>
        </div>
      ) : (
        <>
          {weekday !== null && allDays.length === 0 && (
            <p className="mb-4 rounded-lg bg-surface px-3 py-2 text-sm text-ink-600">
              불러온 기록 중 {WEEKDAY_NAMES[weekday]}요일에 쓴 글이 없어요.
            </p>
          )}
          {weekday === null && logs.length === 0 && (
            <p className="mb-4 rounded-lg bg-surface px-3 py-2 text-sm text-ink-600">
              첫 글을 남겨보세요. 제목과 내용을 적고 저장하면 잔디가 채워져요.
            </p>
          )}
          <div className="divide-y divide-line">
            {days.map(day => (
              <DayGroup
                key={day.date}
                day={day}
                today={today}
                selected={day.date === selectedDate}
                onOpen={onOpen}
                onWrite={onWrite}
              />
            ))}
          </div>
          {hiddenDays > 0 && (
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setVisibleCount(count => count + WEEKDAY_PAGE_SIZE)}
            >
              더 보기 ({hiddenDays}일 더)
            </Button>
          )}
          {hasMore ? (
            <Button type="button" variant="outline" className="mt-4 w-full" onClick={onLoadMore} disabled={isFetchingMore}>
              {isFetchingMore ? '불러오는 중...' : '이전 기록 더 보기'}
            </Button>
          ) : (
            logs.length > 0 && <p className="mt-4 text-center text-xs text-ink-400">최근 1년 기록을 모두 불러왔어요.</p>
          )}
        </>
      )}
    </section>
  )
}
