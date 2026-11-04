import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { StudyLog } from '@/api/types'
import { useCreateStudyLog, useDayStudyLogs, useDeleteStudyLog, useUpdateStudyLog } from '@/hooks/useStudyLogs'
import { getToken } from '@/lib/auth'
import { getErrorMessage } from '@/lib/errors'
import { formatDateLabel, formatMinutes } from '@/lib/studyLog'
import { clearDraft, draftKey, hashDraftBase, loadDraft, saveDraft, userIdFromToken, type StudyLogDraft } from '@/lib/studyLogDraft'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Crepe(ProseMirror)는 번들이 크므로 글쓰기 화면에서만 불러온다.
const MarkdownEditor = lazy(() => import('./MarkdownEditor'))

const MAX_TITLE_LENGTH = 100
const MAX_CONTENT_LENGTH = 10000
const MAX_MINUTES = 24 * 60
const LEAVE_CONFIRM = '저장하지 않은 변경이 있어요. 나갈까요?'

// 입력 칸이 비어 있으면 0분으로 보고, 0~1440 사이 정수가 아니면 null 이다.
function parseMinutes(input: string): number | null {
  if (input.trim() === '') return 0
  const value = Number(input)
  return Number.isInteger(value) && value >= 0 && value <= MAX_MINUTES ? value : null
}

const AUTOSAVE_DELAY_MS = 500

// 임시 저장 시각을 24시간제 HH:mm 으로 보여준다.
function formatClock(timestamp: number): string {
  const time = new Date(timestamp)
  return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
}

interface Draft {
  title: string
  content: string
  minutesInput: string
}

interface StudyLogEditorProps {
  // 새 글이면 작성할 날짜, 기존 글이면 그 글의 날짜
  date: string
  // 기존 글. 없으면 새 글. 시작 값으로만 쓰고 이후 prop 변화는 따라가지 않는다(부모가 key로 새로 마운트한다).
  log: StudyLog | null
  // 새 글이 만들어진 직후, 주소를 바꾸기 전에 만들어진 글의 id와 함께 호출된다.
  onCreated?: (id: number) => void
}

const chipClass = (current: boolean) =>
  cn(
    'inline-flex max-w-[12rem] items-center gap-1 truncate rounded-full border px-3 py-1 text-xs transition-colors duration-150',
    current
      ? 'border-brand-100 bg-brand-50 font-semibold text-brand-700'
      : 'border-line bg-white text-ink-600 hover:bg-surface',
  )

export default function StudyLogEditor({ date, log, onCreated }: StudyLogEditorProps) {
  const navigate = useNavigate()
  const create = useCreateStudyLog()
  const update = useUpdateStudyLog()
  const remove = useDeleteStudyLog()
  const dayLogs = useDayStudyLogs(date)

  const initial: Draft = { title: log?.title ?? '', content: log?.content ?? '', minutesInput: log ? String(log.studyMinutes) : '' }
  const [draft, setDraft] = useState<Draft>(initial)
  const [saved, setSaved] = useState<Draft>(initial)
  const [savedId, setSavedId] = useState<number | null>(log?.id ?? null)

  // 임시 저장은 로그인한 사용자를 알 때만 쓴다. 키에 사용자 id가 들어가 다른 계정의 글과 섞이지 않는다.
  const [userId] = useState(() => userIdFromToken(getToken()))
  const key = userId === null ? null : draftKey(userId, { logId: savedId, date })
  // 시작 값과 다른 임시 글이 남아 있으면 덮어쓰기 전에 사용자에게 먼저 묻는다.
  const [pendingRestore, setPendingRestore] = useState<StudyLogDraft | null>(() => {
    if (key === null) return null
    const stored = loadDraft(key)
    const same = stored !== null && stored.title === initial.title && stored.content === initial.content
      && stored.minutesInput === initial.minutesInput
    return same ? null : stored
  })
  // 임시 글을 쓰기 시작한 뒤 서버의 글이 바뀌었다면(다른 기기 등) 이어 쓰기 전에 알린다.
  const baseChanged = pendingRestore !== null && pendingRestore.baseHash !== null
    && pendingRestore.baseHash !== hashDraftBase(initial)
  // MarkdownEditor는 마운트 때만 initialValue를 읽으므로, 복원할 때는 seed를 올려 새로 마운트한다.
  const [editorContent, setEditorContent] = useState(initial.content)
  const [editorSeed, setEditorSeed] = useState(0)

  const minutes = parseMinutes(draft.minutesInput)
  const dirty = draft.title !== saved.title || draft.content !== saved.content || draft.minutesInput !== saved.minutesInput
  const isSaving = create.isPending || update.isPending
  const isPending = isSaving || remove.isPending
  const tooLong = draft.content.length > MAX_CONTENT_LENGTH
  const canSave =
    draft.title.trim() !== '' && draft.content.trim() !== '' && minutes !== null && !tooLong
    && !isPending && (dirty || savedId === null)
  const error = create.error ?? update.error ?? remove.error
  const status = isSaving ? '저장 중...' : dirty ? '저장하지 않은 변경' : savedId !== null ? '저장됨' : '새 글'
  const siblings = dayLogs.data ?? []

  // 탭을 닫거나 새로고침할 때 저장하지 않은 변경이 있으면 브라우저가 경고하게 한다.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  // 안내가 떠 있는 동안에는 저장된 임시 글을 건드리지 않는다.
  useEffect(() => {
    if (key === null || pendingRestore !== null) return
    if (!dirty) {
      clearDraft(key)
      return
    }
    const timer = setTimeout(
      () => saveDraft(key, { ...draft, baseHash: savedId === null ? null : hashDraftBase(saved) }),
      AUTOSAVE_DELAY_MS,
    )
    return () => clearTimeout(timer)
  }, [key, pendingRestore, dirty, draft, saved, savedId])

  const restoreDraft = () => {
    if (pendingRestore === null) return
    const { title, content, minutesInput } = pendingRestore
    setDraft({ title, content, minutesInput })
    setEditorContent(content)
    setEditorSeed(seed => seed + 1)
    setPendingRestore(null)
  }

  const discardDraft = () => {
    if (key !== null) clearDraft(key)
    setPendingRestore(null)
  }

  const edit = (patch: Partial<Draft>) => {
    create.reset()
    update.reset()
    remove.reset()
    setDraft(prev => ({ ...prev, ...patch }))
  }

  // 앱 안에서 나가는 모든 길(목록으로, 칩)은 여기를 거쳐 저장하지 않은 변경을 확인한다.
  const leave = (to: string) => {
    if (dirty) {
      if (!window.confirm(LEAVE_CONFIRM)) return
      // 복원 안내를 아직 고르지 않았다면 남아 있는 임시 글은 다음에 고를 수 있게 둔다.
      if (key !== null && pendingRestore === null) clearDraft(key)
    }
    navigate(to)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave || minutes === null) return
    const submitted = draft
    const data = { title: submitted.title.trim(), content: submitted.content, studyMinutes: minutes }
    if (savedId === null) {
      create.mutate({ studyDate: date, ...data }, {
        onSuccess: created => {
          if (userId !== null) clearDraft(draftKey(userId, { logId: null, date }))
          // 저장된 글이 새 글 임시 저장본보다 우선하므로 결정하지 않은 복원 안내도 함께 닫는다.
          setPendingRestore(null)
          setSaved(submitted)
          setSavedId(created.id)
          // 부모가 이 에디터를 유지할지 판단하도록 만든 글을 먼저 알린 뒤, 주소만 글 주소로 바꾼다.
          onCreated?.(created.id)
          navigate(`/study-logs/${created.id}`, { replace: true })
        },
      })
    } else {
      update.mutate({ id: savedId, data }, { onSuccess: () => setSaved(submitted) })
    }
  }

  const handleDelete = () => {
    if (savedId === null || !window.confirm('이 글을 삭제할까요?')) return
    remove.mutate(savedId, {
      onSuccess: () => {
        if (key !== null) clearDraft(key)
        navigate('/study-logs', { replace: true })
      },
    })
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3 md:px-8">
        <button
          type="button"
          onClick={() => leave('/study-logs')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors duration-150 hover:text-ink-900"
        >
          <ArrowLeft size={16} aria-hidden />
          목록으로
        </button>
        <span className="hidden text-sm text-ink-600 sm:block">{formatDateLabel(date)}</span>
        <div className="flex items-center gap-2">
          <span role="status" className="text-xs text-ink-600">{status}</span>
          {savedId !== null && (
            <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={isPending} className="text-danger">
              삭제
            </Button>
          )}
          <Button type="submit" form="study-log-form" variant="brand" size="sm" disabled={!canSave}>
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </header>

      <form
        id="study-log-form"
        aria-label="학습 기록 작성"
        onSubmit={handleSubmit}
        className="mx-auto max-w-[720px] px-4 pb-28 pt-8 md:pt-12"
      >
        {pendingRestore !== null && (
          <div
            role="region"
            aria-label="임시 저장된 글"
            className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-ink-900"
          >
            <div className="space-y-1">
              <p>저장하지 않은 글이 있어요. {formatClock(pendingRestore.savedAt)}에 임시 저장됐어요.</p>
              {baseChanged && (
                <p className="font-medium text-ink-900">다른 곳에서 수정된 글이에요. 이어 쓰면 서버의 최신 내용을 덮어써요.</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="brand" size="sm" onClick={restoreDraft}>이어 쓰기</Button>
              <Button type="button" variant="ghost" size="sm" onClick={discardDraft}>버리기</Button>
            </div>
          </div>
        )}

        <label htmlFor="study-title" className="sr-only">제목</label>
        <input
          id="study-title"
          value={draft.title}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="제목을 입력하세요"
          onChange={e => edit({ title: e.target.value })}
          className="w-full bg-transparent text-2xl font-bold text-ink-900 placeholder:text-ink-400 focus:outline-none md:text-3xl"
        />

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line pb-4 text-sm text-ink-600">
          <label htmlFor="study-minutes">공부 시간(분)</label>
          <input
            id="study-minutes"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_MINUTES}
            step={10}
            placeholder="0"
            value={draft.minutesInput}
            onChange={e => edit({ minutesInput: e.target.value })}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span>{minutes === null ? '0~1440 사이로 입력해주세요' : formatMinutes(minutes)}</span>
          <span className={cn('ml-auto text-xs tabular-nums', tooLong ? 'text-danger' : 'text-ink-400')}>
            {draft.content.length.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}
          </span>
        </div>
        {tooLong && <p className="mt-2 text-sm text-danger">10,000자 이하로 줄여주세요</p>}

        <div className="mt-4">
          <Suspense fallback={<div aria-hidden className="min-h-[320px] animate-pulse rounded-md bg-surface" />}>
            <MarkdownEditor
              key={editorSeed}
              initialValue={editorContent}
              ariaLabel="공부한 내용"
              placeholder="공부한 내용을 정리해보세요. / 를 누르면 제목, 표, 목록 같은 블록을 추가할 수 있어요."
              onChange={content => edit({ content })}
            />
          </Suspense>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {getErrorMessage(error, '처리하지 못했습니다. 잠시 후 다시 시도해주세요.')}
          </p>
        )}
      </form>

      {siblings.length > 0 && (
        <nav
          aria-label="이 날의 글"
          className="fixed inset-x-0 bottom-0 flex items-center gap-3 border-t border-line bg-white/95 px-4 py-2 md:px-8"
        >
          <span className="shrink-0 text-xs text-ink-600">이 날의 글</span>
          <ul className="flex min-w-0 gap-2 overflow-x-auto">
            {siblings.map(item => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={item.id === savedId ? 'page' : undefined}
                  onClick={() => item.id !== savedId && leave(`/study-logs/${item.id}`)}
                  className={chipClass(item.id === savedId)}
                >
                  {item.title}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                aria-current={savedId === null ? 'page' : undefined}
                onClick={() => savedId !== null && leave(`/study-logs/new?date=${date}`)}
                className={chipClass(savedId === null)}
              >
                <Plus size={12} aria-hidden />
                새 글
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}
