import { useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useStudyLog } from '@/hooks/useStudyLogs'
import { resolveWriteDate, toDateKey } from '@/lib/studyLog'
import StudyLogEditor from '@/components/studylog/StudyLogEditor'

function Notice({ children, role }: { children: React.ReactNode; role?: 'alert' }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[720px] flex-col items-start justify-center gap-4 px-4 font-sans">
      <p role={role} className="text-ink-600">{children}</p>
      {role === 'alert' && (
        <Link to="/study-logs" className="text-sm font-medium text-brand-600 hover:underline">목록으로</Link>
      )}
    </div>
  )
}

// 사이드바 없는 몰입 글쓰기 화면. /study-logs/new?date=… 는 새 글, /study-logs/:id 는 기존 글이다.
export default function StudyLogWrite() {
  const { logId } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const isNew = logId === 'new'
  const id = isNew ? undefined : Number(logId)
  const hasValidId = isNew || (id !== undefined && Number.isInteger(id))
  const log = useStudyLog(hasValidId ? id : undefined)

  // 주소가 바뀌면 에디터를 새로 시작한다. 단, 새 글을 처음 저장하며 주소만 글 주소로 교체한 경우(keepEditor)는 이어 쓴다.
  const [session, setSession] = useState({ locationKey: location.key, count: 0 })
  if (session.locationKey !== location.key) {
    const keepEditor = (location.state as { keepEditor?: boolean } | null)?.keepEditor === true
    setSession({ locationKey: location.key, count: keepEditor ? session.count : session.count + 1 })
  }

  if (!hasValidId) return <Notice role="alert">글을 찾을 수 없습니다.</Notice>
  if (!isNew && log.isLoading) return <Notice>불러오는 중...</Notice>
  if (!isNew && (log.isError || !log.data)) return <Notice role="alert">글을 찾을 수 없습니다.</Notice>

  const date = isNew
    ? resolveWriteDate(searchParams.get('date'), toDateKey(new Date()))
    : (log.data as NonNullable<typeof log.data>).studyDate
  return <StudyLogEditor key={session.count} date={date} log={isNew ? null : (log.data ?? null)} />
}
