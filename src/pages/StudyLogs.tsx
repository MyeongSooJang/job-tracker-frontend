import { useState } from 'react'
import { useMonthlyStudyLogs, useRecentStudyLogs, useStudyLog, useStudyStats } from '@/hooks/useStudyLogs'
import { toDateKey, toMonthKey } from '@/lib/studyLog'
import StudyLogCalendar from '@/components/studylog/StudyLogCalendar'
import StudyLogEditor from '@/components/studylog/StudyLogEditor'
import StudyStatsBar from '@/components/studylog/StudyStatsBar'
import RecentStudyLogs from '@/components/studylog/RecentStudyLogs'

// 접속하면 오늘 날짜가 선택되어 바로 하루를 정리할 수 있다.
export default function StudyLogs() {
  const today = toDateKey(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [month, setMonth] = useState(toMonthKey(today))

  const stats = useStudyStats()
  const monthLogs = useMonthlyStudyLogs(month)
  const recent = useRecentStudyLogs()
  const day = useStudyLog(selectedDate)

  const writtenDates = new Set((monthLogs.data ?? []).map(log => log.studyDate))

  // 다른 달의 글(최근 글 등)을 고르면 달력도 그 달로 따라간다.
  const selectDate = (date: string) => {
    setSelectedDate(date)
    setMonth(toMonthKey(date))
  }

  return (
    <div className="space-y-6 font-sans">
      <h1 className="text-2xl font-bold text-ink-900">학습 기록</h1>

      {stats.data && <StudyStatsBar stats={stats.data} />}
      {stats.isError && <p role="alert" className="text-sm text-danger">통계를 불러오지 못했습니다.</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {day.isLoading && <p className="text-ink-600">불러오는 중...</p>}
          {day.isError && <p role="alert" className="text-danger">기록을 불러오지 못했습니다.</p>}
          {day.data !== undefined && (
            // 날짜로만 key 를 잡는다. 기록 id 를 넣으면 처음 저장한 직후 에디터가 다시 마운트되어 저장 안내가 사라진다.
            <StudyLogEditor key={selectedDate} date={selectedDate} log={day.data} />
          )}
        </div>
        <div className="space-y-6">
          <StudyLogCalendar
            month={month}
            today={today}
            selectedDate={selectedDate}
            writtenDates={writtenDates}
            onMonthChange={setMonth}
            onSelect={selectDate}
          />
          <RecentStudyLogs logs={recent.data ?? []} selectedDate={selectedDate} onSelect={selectDate} />
        </div>
      </div>
    </div>
  )
}
