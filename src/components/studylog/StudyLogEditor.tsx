import { lazy, Suspense, useEffect, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { StudyLog } from '@/api/types'
import { useCreateStudyLog, useDayStudyLogs, useDeleteStudyLog, useUpdateStudyLog } from '@/hooks/useStudyLogs'
import { getErrorMessage } from '@/lib/errors'
import { formatDateLabel, formatMinutes } from '@/lib/studyLog'
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
}

const chipClass = (current: boolean) =>
  cn(
    'inline-flex max-w-[12rem] items-center gap-1 truncate rounded-full border px-3 py-1 text-xs transition-colors duration-150',
    current
      ? 'border-brand-100 bg-brand-50 font-semibold text-brand-700'
      : 'border-line bg-white text-ink-600 hover:bg-surface',
  )

export default function StudyLogEditor({ date, log }: StudyLogEditorProps) {
  const navigate = useNavigate()
  const create = useCreateStudyLog()
  const update = useUpdateStudyLog()
  const remove = useDeleteStudyLog()
  const dayLogs = useDayStudyLogs(date)

  const initial: Draft = { title: log?.title ?? '', content: log?.content ?? '', minutesInput: log ? String(log.studyMinutes) : '' }
  const [draft, setDraft] = useState<Draft>(initial)
  const [saved, setSaved] = useState<Draft>(initial)
  const [savedId, setSavedId] = useState<number | null>(log?.id ?? null)

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

  const edit = (patch: Partial<Draft>) => {
    create.reset()
    update.reset()
    remove.reset()
    setDraft(prev => ({ ...prev, ...patch }))
  }

  // 앱 안에서 나가는 모든 길(목록으로, 칩)은 여기를 거쳐 저장하지 않은 변경을 확인한다.
  const leave = (to: string) => {
    if (dirty && !window.confirm(LEAVE_CONFIRM)) return
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
          setSaved(submitted)
          setSavedId(created.id)
          // 에디터를 다시 만들지 않도록 keepEditor 표시를 남기고 주소만 글 주소로 바꾼다.
          navigate(`/study-logs/${created.id}`, { replace: true, state: { keepEditor: true } })
        },
      })
    } else {
      update.mutate({ id: savedId, data }, { onSuccess: () => setSaved(submitted) })
    }
  }

  const handleDelete = () => {
    if (savedId === null || !window.confirm('이 글을 삭제할까요?')) return
    remove.mutate(savedId, { onSuccess: () => navigate('/study-logs', { replace: true }) })
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
              initialValue={initial.content}
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
