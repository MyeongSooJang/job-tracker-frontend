import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { StudyLog } from '@/api/types'
import StudyLogWrite from '../StudyLogWrite'

let mounts = 0
const existing: StudyLog = { id: 5, studyDate: '2026-10-20', title: '기존 글', content: '내용', studyMinutes: 30 }

vi.mock('@/components/studylog/StudyLogEditor', () => ({
  default: function EditorStub({ date, log, onCreated }: { date: string; log: StudyLog | null; onCreated?: (id: number) => void }) {
    const [instance] = useState(() => ++mounts)
    return (
      <>
        <div data-testid="editor" data-instance={instance} data-date={date} data-log-id={log?.id ?? ''} />
        <button onClick={() => onCreated?.(5)}>글 만들기</button>
      </>
    )
  },
}))

vi.mock('@/hooks/useStudyLogs', () => ({
  useStudyLog: (id: number | undefined) => {
    if (id === 5 || id === 6) return { data: { ...existing, id }, isLoading: false, isError: false }
    if (id === 99) return { data: undefined, isLoading: false, isError: true }
    if (id === 100) return { data: undefined, isLoading: true, isError: false }
    return { data: undefined, isLoading: false, isError: false }
  },
}))

function Nav() {
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate('/study-logs/5', { replace: true })}>저장 후 주소 교체</button>
      <button onClick={() => navigate('/study-logs/6')}>다른 글로 이동</button>
      <button onClick={() => navigate('/study-logs/new?date=2026-10-20')}>새 글 칩</button>
      <button onClick={() => navigate(-1)}>뒤로가기</button>
    </>
  )
}

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/study-logs/:logId" element={<><StudyLogWrite /><Nav /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('StudyLogWrite 페이지', () => {
  beforeEach(() => {
    mounts = 0
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 4))
  })
  afterEach(() => vi.useRealTimers())

  it('새 글은 주소의 date로 빈 글쓰기 화면을 연다', () => {
    renderAt('/study-logs/new?date=2026-11-03')

    expect(screen.getByTestId('editor')).toHaveAttribute('data-date', '2026-11-03')
    expect(screen.getByTestId('editor')).toHaveAttribute('data-log-id', '')
  })

  it.each(['', '?date=abc', '?date=2026-12-25'])('새 글의 date가 없거나 틀렸거나 미래이면 오늘로 연다 (%s)', query => {
    renderAt(`/study-logs/new${query}`)

    expect(screen.getByTestId('editor')).toHaveAttribute('data-date', '2026-11-04')
  })

  it('기존 글은 불러온 글과 그 글의 날짜로 연다', () => {
    renderAt('/study-logs/5')

    expect(screen.getByTestId('editor')).toHaveAttribute('data-log-id', '5')
    expect(screen.getByTestId('editor')).toHaveAttribute('data-date', '2026-10-20')
  })

  it('글을 불러오는 동안에는 에디터 대신 불러오는 중을 보여준다', () => {
    renderAt('/study-logs/100')

    expect(screen.queryByTestId('editor')).not.toBeInTheDocument()
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument()
  })

  it('없는 글이면 찾을 수 없다고 알리고 목록으로 가는 링크를 보여준다', () => {
    renderAt('/study-logs/99')

    expect(screen.getByRole('alert')).toHaveTextContent('글을 찾을 수 없습니다')
    expect(screen.getByRole('link', { name: '목록으로' })).toHaveAttribute('href', '/study-logs')
  })

  it('숫자가 아닌 글 주소도 찾을 수 없다고 알린다', () => {
    renderAt('/study-logs/abc')

    expect(screen.getByRole('alert')).toHaveTextContent('글을 찾을 수 없습니다')
  })

  it('새 글을 처음 저장해 주소만 바뀌어도 에디터를 다시 만들지 않는다', async () => {
    const user = userEvent.setup()
    renderAt('/study-logs/new?date=2026-10-20')
    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '1')

    await user.click(screen.getByRole('button', { name: '글 만들기' }))
    await user.click(screen.getByRole('button', { name: '저장 후 주소 교체' }))

    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '1')
  })

  it('글을 만들지 않았다면 주소가 바뀌어도 에디터를 새로 만든다', async () => {
    const user = userEvent.setup()
    renderAt('/study-logs/new?date=2026-10-20')

    await user.click(screen.getByRole('button', { name: '저장 후 주소 교체' }))

    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '2')
  })

  it('저장 후 주소를 교체한 글로 뒤로가기하면 에디터를 새로 만든다', async () => {
    const user = userEvent.setup()
    renderAt('/study-logs/new?date=2026-10-20')
    await user.click(screen.getByRole('button', { name: '글 만들기' }))
    await user.click(screen.getByRole('button', { name: '저장 후 주소 교체' }))
    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '1')
    await user.click(screen.getByRole('button', { name: '다른 글로 이동' }))
    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '2')

    await user.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '3')
    expect(screen.getByTestId('editor')).toHaveAttribute('data-log-id', '5')
  })

  it('글을 만든 뒤 새 글로 갔다가 뒤로가기하면 비어 있는 에디터가 남지 않고 새로 만든다', async () => {
    const user = userEvent.setup()
    renderAt('/study-logs/new?date=2026-10-20')
    await user.click(screen.getByRole('button', { name: '글 만들기' }))
    await user.click(screen.getByRole('button', { name: '저장 후 주소 교체' }))
    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '1')
    await user.click(screen.getByRole('button', { name: '새 글 칩' }))
    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '2')

    await user.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '3')
    expect(screen.getByTestId('editor')).toHaveAttribute('data-log-id', '5')
  })

  it('다른 글로 이동하면 에디터를 새로 만든다', async () => {
    const user = userEvent.setup()
    renderAt('/study-logs/5')

    await user.click(screen.getByRole('button', { name: '다른 글로 이동' }))

    expect(screen.getByTestId('editor')).toHaveAttribute('data-instance', '2')
  })
})
