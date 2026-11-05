import { useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useStudyLog } from '@/hooks/useStudyLogs'
import { resolveWriteDate, toDateKey } from '@/lib/studyLog'
import StudyLogEditor from '@/components/studylog/StudyLogEditor'

function Notice({ children, role }: { children: React.ReactNode; role?: 'alert' | 'status' }) {
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

  // 주소가 바뀌면 에디터를 새로 시작한다. 단, 지금 떠 있는 에디터가 방금 만든 글의 주소로 교체된 경우에만 이어 쓴다.
  // 이력(state)으로 추측하지 않고 "어느 에디터 세션이 어떤 글을 만들었는지"를 직접 기록하므로, 뒤로가기·앞으로가기로 어떤 항목에 돌아와도 어긋나지 않는다.
  const [session, setSession] = useState({ locationKey: location.key, count: 0 })
  const [created, setCreated] = useState<{ session: number; id: number } | null>(null)
  if (session.locationKey !== location.key) {
    const keepEditor =
      created !== null && created.session === session.count && location.pathname === `/study-logs/${created.id}`
    setSession({ locationKey: location.key, count: keepEditor ? session.count : session.count + 1 })
  }

  if (!hasValidId) return <Notice role="alert">글을 찾을 수 없습니다.</Notice>
  if (!isNew && log.isLoading) return <Notice role="status">불러오는 중...</Notice>
  if (!isNew && (log.isError || !log.data)) return <Notice role="alert">글을 찾을 수 없습니다.</Notice>

  const date = isNew
    ? resolveWriteDate(searchParams.get('date'), toDateKey(new Date()))
    : (log.data as NonNullable<typeof log.data>).studyDate
  return (
    <StudyLogEditor
      key={session.count}
      date={date}
      log={isNew ? null : (log.data ?? null)}
      // 에디터는 onCreated를 navigate보다 먼저 부른다. 주소가 바뀐 렌더에서 created가 이미 있어야 에디터를 유지한다.
      onCreated={id => setCreated({ session: session.count, id })}
    />
  )
}
