import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { StudyLog } from '@/api/types'
import { useDeleteStudyLog, useSaveStudyLog } from '@/hooks/useStudyLogs'
import { getErrorMessage } from '@/lib/errors'
import { formatDateLabel, formatMinutes } from '@/lib/studyLog'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const MAX_CONTENT_LENGTH = 10000
const MAX_MINUTES = 24 * 60

const MARKDOWN_CLASS = [
  'space-y-3 break-words text-sm text-ink-900',
  '[&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_code]:rounded [&_code]:bg-surface [&_code]:px-1',
  '[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-surface [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:px-0',
  '[&_a]:text-brand-600 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_blockquote]:text-ink-600',
].join(' ')

type Tab = 'write' | 'preview'

// 입력 칸이 비어 있으면 0분으로 보고, 0~1440 사이 정수가 아니면 null 이다.
function parseMinutes(input: string): number | null {
  if (input.trim() === '') return 0
  const value = Number(input)
  return Number.isInteger(value) && value >= 0 && value <= MAX_MINUTES ? value : null
}

interface StudyLogEditorProps {
  date: string
  log: StudyLog | null
}

// 날짜가 바뀌면 부모가 key 를 바꿔 입력 상태를 새로 시작한다. 같은 날 안에서는 저장·삭제 후에도 이 입력 상태를 이어 쓴다.
export default function StudyLogEditor({ date, log }: StudyLogEditorProps) {
  const save = useSaveStudyLog()
  const remove = useDeleteStudyLog()
  const [content, setContent] = useState(log?.content ?? '')
  const [minutesInput, setMinutesInput] = useState(log ? String(log.studyMinutes) : '')
  const [tab, setTab] = useState<Tab>('write')

  const minutes = parseMinutes(minutesInput)
  const isPending = save.isPending || remove.isPending
  const canSave = content.trim().length > 0 && minutes !== null && !isPending
  const error = save.error ?? remove.error

  const edit = (apply: () => void) => {
    save.reset()
    remove.reset()
    apply()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave || minutes === null) return
    save.mutate({ date, data: { content, studyMinutes: minutes } })
  }

  const handleDelete = () => {
    if (!window.confirm('이 날의 기록을 삭제할까요?')) return
    remove.mutate(date, {
      onSuccess: () => {
        setContent('')
        setMinutesInput('')
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="학습 기록 작성"
      className="space-y-4 rounded-xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.05)] sm:p-6"
    >
      <header className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-ink-900">{formatDateLabel(date)}</h2>
        <span className="text-xs text-ink-400">{log ? '작성한 기록' : '아직 기록이 없습니다'}</span>
      </header>

      <div className="space-y-1.5">
        <Label htmlFor="study-minutes" className="text-ink-900">공부 시간 (분)</Label>
        <div className="flex items-center gap-3">
          <Input
            id="study-minutes"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_MINUTES}
            step={10}
            className="w-32"
            placeholder="0"
            value={minutesInput}
            onChange={e => edit(() => setMinutesInput(e.target.value))}
          />
          <span className="text-sm text-ink-600">{minutes === null ? '0~1440 사이로 입력해주세요' : formatMinutes(minutes)}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="study-content" className="text-ink-900">공부한 내용</Label>
          <div role="tablist" aria-label="편집 모드" className="flex gap-1 rounded-lg bg-surface p-1 text-xs">
            {([['write', '작성'], ['preview', '미리보기']] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  'rounded-md px-3 py-1 font-medium transition-colors',
                  tab === id ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600 hover:text-ink-900',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {tab === 'write' ? (
          <Textarea
            id="study-content"
            className="min-h-[320px] font-mono leading-relaxed"
            placeholder="오늘 공부한 내용을 마크다운으로 자유롭게 정리해보세요."
            maxLength={MAX_CONTENT_LENGTH}
            value={content}
            onChange={e => edit(() => setContent(e.target.value))}
          />
        ) : (
          <div className="min-h-[320px] rounded-md border border-line px-3 py-2" aria-label="미리보기">
            {content.trim() === ''
              ? <p className="text-sm text-ink-400">미리볼 내용이 없습니다.</p>
              : <div className={MARKDOWN_CLASS}><ReactMarkdown>{content}</ReactMarkdown></div>}
          </div>
        )}
        <p className="text-right text-xs tabular-nums text-ink-400">{content.length} / {MAX_CONTENT_LENGTH}</p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {getErrorMessage(error, '처리하지 못했습니다. 잠시 후 다시 시도해주세요.')}
        </p>
      )}
      {save.isSuccess && <p role="status" className="text-sm text-success">저장했습니다.</p>}

      <div className="flex items-center justify-between pt-1">
        {log ? (
          <Button type="button" variant="ghost" onClick={handleDelete} disabled={isPending} className="text-danger">
            삭제
          </Button>
        ) : <span />}
        <Button type="submit" variant="brand" disabled={!canSave}>
          {save.isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  )
}
