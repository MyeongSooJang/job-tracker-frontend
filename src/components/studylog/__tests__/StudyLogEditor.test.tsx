import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { StudyLog } from '@/api/types'
import { hashDraftBase } from '@/lib/studyLogDraft'
import StudyLogEditor from '../StudyLogEditor'

const createMutate = vi.fn()
const updateMutate = vi.fn()
const deleteMutate = vi.fn()
let dayLogs: StudyLog[] = []

const idle = (mutate: ReturnType<typeof vi.fn>) => () => ({
  mutate, isPending: false, error: null, reset: vi.fn(),
})

vi.mock('@/hooks/useStudyLogs', () => ({
  useCreateStudyLog: () => idle(createMutate)(),
  useUpdateStudyLog: () => idle(updateMutate)(),
  useDeleteStudyLog: () => idle(deleteMutate)(),
  useDayStudyLogs: () => ({ data: dayLogs }),
}))

// jsdom에서는 Crepe가 동작하지 않으므로 같은 계약(initialValue/onChange)을 가진 textarea로 바꾼다.
vi.mock('../MarkdownEditor', () => ({
  default: ({ initialValue, onChange }: { initialValue: string; onChange: (value: string) => void }) => (
    <textarea aria-label="공부한 내용" defaultValue={initialValue} onChange={e => onChange(e.target.value)} />
  ),
}))

const DATE = '2026-11-03'
const log: StudyLog = { id: 1, studyDate: DATE, title: 'JPA 정리', content: '## JPA', studyMinutes: 90 }

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

async function renderEditor(existing: StudyLog | null = null, onCreated?: (id: number) => void) {
  const { unmount } = render(
    <MemoryRouter>
      <StudyLogEditor date={DATE} log={existing} onCreated={onCreated} />
      <LocationProbe />
    </MemoryRouter>,
  )
  await screen.findByLabelText('공부한 내용')
  return { unmount }
}

describe('StudyLogEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dayLogs = []
  })
  afterEach(() => vi.restoreAllMocks())

  it('제목이나 내용이 비어 있으면 저장할 수 없다', async () => {
    const user = userEvent.setup()
    await renderEditor()
    const save = screen.getByRole('button', { name: '저장' })
    expect(save).toBeDisabled()

    await user.type(screen.getByLabelText('제목'), 'JPA 정리')
    expect(save).toBeDisabled()

    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
    expect(save).toBeEnabled()
  })

  it('제목과 공부 시간과 내용을 입력하고 저장하면 해당 날짜로 글 작성을 요청한다', async () => {
    const user = userEvent.setup()
    await renderEditor()

    await user.type(screen.getByLabelText('제목'), 'JPA 정리')
    await user.type(screen.getByLabelText('공부 시간(분)'), '90')
    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(createMutate).toHaveBeenCalledWith(
      { studyDate: DATE, title: 'JPA 정리', content: 'JPA 공부', studyMinutes: 90 },
      expect.anything(),
    )
  })

  it('공부 시간을 비워 두면 0분으로 저장한다', async () => {
    const user = userEvent.setup()
    await renderEditor()

    await user.type(screen.getByLabelText('제목'), 'JPA 정리')
    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(createMutate).toHaveBeenCalledWith(expect.objectContaining({ studyMinutes: 0 }), expect.anything())
  })

  it('제목 앞뒤 공백은 지우고 저장한다', async () => {
    const user = userEvent.setup()
    await renderEditor()

    await user.type(screen.getByLabelText('제목'), '  JPA 정리  ')
    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(createMutate).toHaveBeenCalledWith(expect.objectContaining({ title: 'JPA 정리' }), expect.anything())
  })

  it('공부 시간이 1440분을 넘으면 안내하고 저장할 수 없다', async () => {
    const user = userEvent.setup()
    await renderEditor()

    await user.type(screen.getByLabelText('제목'), 'JPA 정리')
    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
    await user.type(screen.getByLabelText('공부 시간(분)'), '1441')

    expect(screen.getByText('0~1440 사이로 입력해주세요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('내용이 10000자를 넘으면 줄이도록 안내하고 저장할 수 없다', async () => {
    const user = userEvent.setup()
    await renderEditor()
    await user.type(screen.getByLabelText('제목'), 'JPA 정리')

    fireEvent.change(screen.getByLabelText('공부한 내용'), { target: { value: 'a'.repeat(10001) } })

    expect(screen.getByText('10,000자 이하로 줄여주세요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('작성한 글이 있으면 제목과 공부 시간을 채우고, 바꾸기 전에는 저장할 수 없다', async () => {
    await renderEditor(log)

    expect(screen.getByLabelText('제목')).toHaveValue('JPA 정리')
    expect(screen.getByLabelText('공부 시간(분)')).toHaveValue(90)
    expect(screen.getByLabelText('공부한 내용')).toHaveValue('## JPA')
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('작성한 글을 고쳐 저장하면 그 글의 id로 수정을 요청한다', async () => {
    const user = userEvent.setup()
    await renderEditor(log)

    await user.type(screen.getByLabelText('제목'), ' 보강')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(updateMutate).toHaveBeenCalledWith(
      { id: 1, data: { title: 'JPA 정리 보강', content: '## JPA', studyMinutes: 90 } },
      expect.anything(),
    )
    expect(createMutate).not.toHaveBeenCalled()
  })

  it('수정을 저장하면 저장됨으로 표시하고 다시 저장할 수 없다', async () => {
    updateMutate.mockImplementationOnce((_vars, options?: { onSuccess?: () => void }) => options?.onSuccess?.())
    const user = userEvent.setup()
    await renderEditor(log)

    await user.type(screen.getByLabelText('제목'), ' 보강')
    expect(screen.getByRole('status')).toHaveTextContent('저장하지 않은 변경')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(screen.getByRole('status')).toHaveTextContent('저장됨')
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('새 글을 처음 저장하면 글 주소로 바꾸고 이후 저장은 수정 요청이 된다', async () => {
    createMutate.mockImplementationOnce((_data, options?: { onSuccess?: (created: StudyLog) => void }) =>
      options?.onSuccess?.({ ...log, id: 7 }))
    const user = userEvent.setup()
    await renderEditor()

    await user.type(screen.getByLabelText('제목'), 'JPA 정리')
    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/study-logs/7')
    expect(screen.getByRole('status')).toHaveTextContent('저장됨')

    await user.type(screen.getByLabelText('제목'), ' 보강')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(updateMutate).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }), expect.anything())
  })

  it('새 글을 처음 저장하면 만들어진 글의 id를 알린다', async () => {
    createMutate.mockImplementationOnce((_data, options?: { onSuccess?: (created: StudyLog) => void }) =>
      options?.onSuccess?.({ ...log, id: 7 }))
    const onCreated = vi.fn()
    const user = userEvent.setup()
    await renderEditor(null, onCreated)

    await user.type(screen.getByLabelText('제목'), 'JPA 정리')
    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(onCreated).toHaveBeenCalledWith(7)
  })

  it('새 글에는 삭제 버튼이 없다', async () => {
    await renderEditor()

    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
  })

  it('삭제를 확인하면 글을 삭제하고 목록으로 돌아간다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    deleteMutate.mockImplementationOnce((_id, options?: { onSuccess?: () => void }) => options?.onSuccess?.())
    const user = userEvent.setup()
    await renderEditor(log)

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(deleteMutate).toHaveBeenCalledWith(1, expect.anything())
    expect(screen.getByTestId('location')).toHaveTextContent('/study-logs')
  })

  it('삭제를 취소하면 삭제하지 않는다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    await renderEditor(log)

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(deleteMutate).not.toHaveBeenCalled()
  })

  it('변경이 없으면 확인 없이 목록으로 나간다', async () => {
    const confirm = vi.spyOn(window, 'confirm')
    const user = userEvent.setup()
    await renderEditor(log)

    await user.click(screen.getByRole('button', { name: '목록으로' }))

    expect(confirm).not.toHaveBeenCalled()
    expect(screen.getByTestId('location')).toHaveTextContent('/study-logs')
  })

  it('저장하지 않은 변경이 있으면 나가기 전에 확인하고 취소하면 머문다', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    await renderEditor(log)
    await user.type(screen.getByLabelText('제목'), ' 보강')

    await user.click(screen.getByRole('button', { name: '목록으로' }))

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
    expect(screen.getByTestId('location')).not.toHaveTextContent('/study-logs')
  })

  it('저장하지 않은 변경이 있어도 확인하면 나간다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    await renderEditor(log)
    await user.type(screen.getByLabelText('제목'), ' 보강')

    await user.click(screen.getByRole('button', { name: '목록으로' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/study-logs')
  })

  it('저장하지 않은 변경이 있으면 탭을 닫을 때 브라우저 경고를 띄운다', async () => {
    const user = userEvent.setup()
    await renderEditor(log)
    await user.type(screen.getByLabelText('제목'), ' 보강')

    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('이 날의 다른 글을 칩으로 보여주고 누르면 그 글로 이동한다', async () => {
    dayLogs = [log, { id: 2, studyDate: DATE, title: '알고리즘', content: '투 포인터', studyMinutes: 30 }]
    const user = userEvent.setup()
    await renderEditor(log)
    const nav = screen.getByRole('navigation', { name: '이 날의 글' })

    expect(within(nav).getByRole('button', { name: 'JPA 정리' })).toHaveAttribute('aria-current', 'page')
    await user.click(within(nav).getByRole('button', { name: '알고리즘' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/study-logs/2')
  })

  it('새 글 칩을 누르면 같은 날짜의 새 글 작성으로 이동한다', async () => {
    dayLogs = [log]
    const user = userEvent.setup()
    await renderEditor(log)

    await user.click(within(screen.getByRole('navigation', { name: '이 날의 글' })).getByRole('button', { name: /새 글/ }))

    expect(screen.getByTestId('location')).toHaveTextContent(`/study-logs/new?date=${DATE}`)
  })

  it('이 날 쓴 글이 없으면 칩 영역을 보여주지 않는다', async () => {
    await renderEditor()

    expect(screen.queryByRole('navigation', { name: '이 날의 글' })).not.toBeInTheDocument()
  })

  describe('임시 저장', () => {
    const base64url = (value: string) => btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const tokenFor = (sub: string) => `${base64url('{"alg":"HS256"}')}.${base64url(JSON.stringify({ sub }))}.signature`
    const NEW_KEY = `study-log-draft:v1:7:new-${DATE}`
    const LOG_KEY = 'study-log-draft:v1:7:1'
    const savedAt = new Date(2026, 10, 3, 14, 5).getTime()
    const stored = (key: string) => {
      const raw = localStorage.getItem(key)
      return raw === null ? null : JSON.parse(raw)
    }
    const store = (key: string, value: object) => localStorage.setItem(key, JSON.stringify(value))
    const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })
    const setup = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    beforeEach(() => {
      localStorage.clear()
      localStorage.setItem('job-tracker.accessToken', tokenFor('7'))
      vi.useFakeTimers({ shouldAdvanceTime: true })
      // 보관 기간 정리와 "오늘" 표기가 실제 날짜에 흔들리지 않도록 시계를 고정한다.
      vi.setSystemTime(new Date(2026, 10, 3, 18, 0))
    })
    afterEach(() => {
      vi.useRealTimers()
      localStorage.clear()
    })

    it('고친 내용은 500ms 동안 입력이 멈춘 뒤에 임시 저장한다', async () => {
      await renderEditor()

      // user.type은 키마다 시계를 흘려보내 경계를 흐리므로 한 번에 바꾼다.
      fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'JPA' } })
      expect(stored(NEW_KEY)).toBeNull()

      advance(499)
      expect(stored(NEW_KEY)).toBeNull()

      advance(1)
      expect(stored(NEW_KEY)).toMatchObject({ title: 'JPA', content: '', minutesInput: '' })
    })

    it('변경이 없으면 아무것도 저장하지 않는다', async () => {
      await renderEditor(log)
      advance(2000)

      expect(stored(LOG_KEY)).toBeNull()
      expect(localStorage.length).toBe(1)
    })

    it('로그인 정보가 없으면 임시 저장을 읽거나 쓰지 않는다', async () => {
      localStorage.clear()
      const getItem = vi.spyOn(Storage.prototype, 'getItem')
      const setItem = vi.spyOn(Storage.prototype, 'setItem')
      const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
      const user = setup()
      await renderEditor()

      await user.type(screen.getByLabelText('제목'), 'JPA')
      advance(1000)

      const draftCalls = [...getItem.mock.calls, ...setItem.mock.calls, ...removeItem.mock.calls].filter(([key]) => String(key).startsWith('study-log-draft'))
      expect(draftCalls).toEqual([])
    })

    it('저장되지 않은 임시 글이 있으면 시각과 함께 안내한다', async () => {
      store(NEW_KEY, { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt })
      await renderEditor()

      const banner = screen.getByRole('region', { name: '임시 저장된 글' })
      expect(banner).toHaveTextContent('저장하지 않은 글이 있어요. 14:05에 임시 저장됐어요.')
    })

    it('오늘이 아닌 날 저장된 임시 글은 날짜와 함께 안내한다', async () => {
      store(NEW_KEY, { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt: new Date(2026, 10, 2, 21, 40).getTime() })
      await renderEditor()

      expect(screen.getByRole('region', { name: '임시 저장된 글' }))
        .toHaveTextContent('저장하지 않은 글이 있어요. 11월 2일 21:40에 임시 저장됐어요.')
    })

    it('이어 쓰기를 누르면 제목 입력 칸으로 포커스를 옮긴다', async () => {
      store(NEW_KEY, { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt })
      const user = setup()
      await renderEditor()

      await user.click(screen.getByRole('button', { name: '이어 쓰기' }))

      expect(screen.getByLabelText('제목')).toHaveFocus()
    })

    it('버리기를 누르면 제목 입력 칸으로 포커스를 옮긴다', async () => {
      store(NEW_KEY, { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt })
      const user = setup()
      await renderEditor()

      await user.click(screen.getByRole('button', { name: '버리기' }))

      expect(screen.getByLabelText('제목')).toHaveFocus()
    })

    it('마운트하면 같은 사용자의 30일 지난 임시 글만 정리한다', async () => {
      const day = 24 * 60 * 60 * 1000
      const now = Date.now()
      const entry = (age: number) => ({ title: 'a', content: 'b', minutesInput: '', baseHash: null, savedAt: now - age })
      store('study-log-draft:v1:7:99', entry(31 * day))
      store('study-log-draft:v1:7:98', entry(day))
      store('study-log-draft:v1:8:99', entry(31 * day))
      await renderEditor(log)

      expect(stored('study-log-draft:v1:7:99')).toBeNull()
      expect(stored('study-log-draft:v1:7:98')).not.toBeNull()
      expect(stored('study-log-draft:v1:8:99')).not.toBeNull()
    })

    it('이어 쓰기를 누르면 임시 글로 제목, 공부 시간, 내용을 채운다', async () => {
      store(NEW_KEY, { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt })
      const user = setup()
      await renderEditor()

      await user.click(screen.getByRole('button', { name: '이어 쓰기' }))

      expect(screen.getByLabelText('제목')).toHaveValue('쓰던 글')
      expect(screen.getByLabelText('공부 시간(분)')).toHaveValue(45)
      expect(screen.getByLabelText('공부한 내용')).toHaveValue('쓰던 내용')
      expect(screen.queryByRole('region', { name: '임시 저장된 글' })).not.toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent('저장하지 않은 변경')
    })

    it('이어 쓰기 뒤에도 계속 임시 저장한다', async () => {
      store(NEW_KEY, { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt })
      const user = setup()
      await renderEditor()
      await user.click(screen.getByRole('button', { name: '이어 쓰기' }))

      await user.type(screen.getByLabelText('제목'), '!')
      advance(500)

      expect(stored(NEW_KEY)).toMatchObject({ title: '쓰던 글!', content: '쓰던 내용' })
    })

    it('버리기를 누르면 임시 글을 지우고 안내를 숨긴다', async () => {
      store(NEW_KEY, { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt })
      const user = setup()
      await renderEditor()

      await user.click(screen.getByRole('button', { name: '버리기' }))

      expect(stored(NEW_KEY)).toBeNull()
      expect(screen.queryByRole('region', { name: '임시 저장된 글' })).not.toBeInTheDocument()
      expect(screen.getByLabelText('제목')).toHaveValue('')
    })

    it('임시 글이 시작 값과 같으면 안내하지 않고 지운다', async () => {
      store(LOG_KEY, { title: 'JPA 정리', content: '## JPA', minutesInput: '90', savedAt })
      await renderEditor(log)

      expect(screen.queryByRole('region', { name: '임시 저장된 글' })).not.toBeInTheDocument()
      expect(stored(LOG_KEY)).toBeNull()
    })

    it('안내가 떠 있는 동안에는 임시 글을 지우거나 덮어쓰지 않는다', async () => {
      const draft = { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt }
      store(NEW_KEY, draft)
      const user = setup()
      await renderEditor()
      advance(1000)

      expect(stored(NEW_KEY)).toEqual(draft)

      await user.type(screen.getByLabelText('제목'), '새로 입력')
      advance(1000)

      expect(stored(NEW_KEY)).toEqual(draft)
    })

    it('수정을 저장하면 임시 글을 지운다', async () => {
      updateMutate.mockImplementationOnce((_vars, options?: { onSuccess?: () => void }) => options?.onSuccess?.())
      const user = setup()
      await renderEditor(log)
      await user.type(screen.getByLabelText('제목'), ' 보강')
      advance(500)
      expect(stored(LOG_KEY)).not.toBeNull()

      await user.click(screen.getByRole('button', { name: '저장' }))

      expect(stored(LOG_KEY)).toBeNull()
    })

    it('새 글을 처음 저장하면 날짜 기준 임시 글을 지우고 글 id 기준으로 넘어간다', async () => {
      createMutate.mockImplementationOnce((_data, options?: { onSuccess?: (created: StudyLog) => void }) =>
        options?.onSuccess?.({ ...log, id: 7 }))
      const user = setup()
      await renderEditor()
      await user.type(screen.getByLabelText('제목'), 'JPA 정리')
      await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
      advance(500)
      expect(stored(NEW_KEY)).not.toBeNull()

      await user.click(screen.getByRole('button', { name: '저장' }))
      advance(1000)

      expect(stored(NEW_KEY)).toBeNull()
      expect(stored('study-log-draft:v1:7:7')).toBeNull()

      await user.type(screen.getByLabelText('제목'), ' 보강')
      advance(500)

      expect(stored('study-log-draft:v1:7:7')).toMatchObject({ title: 'JPA 정리 보강' })
      expect(stored(NEW_KEY)).toBeNull()
    })

    it('복원 안내를 고르지 않은 채 처음 저장하면 안내를 닫고 글 id 기준으로 임시 저장한다', async () => {
      store(NEW_KEY, { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt })
      createMutate.mockImplementationOnce((_data, options?: { onSuccess?: (created: StudyLog) => void }) =>
        options?.onSuccess?.({ ...log, id: 7 }))
      const user = setup()
      await renderEditor()
      expect(screen.getByRole('region', { name: '임시 저장된 글' })).toBeInTheDocument()

      await user.type(screen.getByLabelText('제목'), 'JPA 정리')
      await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
      await user.click(screen.getByRole('button', { name: '저장' }))

      expect(screen.queryByRole('region', { name: '임시 저장된 글' })).not.toBeInTheDocument()
      expect(stored(NEW_KEY)).toBeNull()

      await user.type(screen.getByLabelText('제목'), ' 보강')
      advance(500)

      expect(stored('study-log-draft:v1:7:7')).toMatchObject({ title: 'JPA 정리 보강' })
      expect(stored(NEW_KEY)).toBeNull()
    })

    describe('기준 버전 확인', () => {
      const WARNING = '다른 곳에서 수정된 글이에요. 이어 쓰면 서버의 최신 내용을 덮어써요.'
      const loaded = { title: log.title, content: log.content, minutesInput: String(log.studyMinutes) }
      const edited = { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt }

      it('기준이 지금 글과 같으면 경고 없이 안내한다', async () => {
        store(LOG_KEY, { ...edited, baseHash: hashDraftBase(loaded) })
        await renderEditor(log)

        expect(screen.getByRole('region', { name: '임시 저장된 글' })).toBeInTheDocument()
        expect(screen.queryByText(WARNING)).not.toBeInTheDocument()
      })

      it('기준이 지금 글과 다르면 덮어쓴다는 경고를 함께 보여준다', async () => {
        store(LOG_KEY, { ...edited, baseHash: hashDraftBase({ ...loaded, content: '## 예전 내용' }) })
        await renderEditor(log)

        expect(within(screen.getByRole('region', { name: '임시 저장된 글' })).getByText(WARNING)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '이어 쓰기' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '버리기' })).toBeInTheDocument()
      })

      it('기준 해시가 없는 예전 임시 글은 경고하지 않는다', async () => {
        store(LOG_KEY, edited)
        await renderEditor(log)

        expect(screen.getByRole('region', { name: '임시 저장된 글' })).toBeInTheDocument()
        expect(screen.queryByText(WARNING)).not.toBeInTheDocument()
      })

      it('새 글 임시 저장본은 경고하지 않는다', async () => {
        store(NEW_KEY, { ...edited, baseHash: null })
        await renderEditor()

        expect(screen.getByRole('region', { name: '임시 저장된 글' })).toBeInTheDocument()
        expect(screen.queryByText(WARNING)).not.toBeInTheDocument()
      })

      it('기존 글을 고치면 불러온 값의 해시를 기준으로 임시 저장한다', async () => {
        const user = setup()
        await renderEditor(log)

        await user.type(screen.getByLabelText('제목'), ' 보강')
        advance(500)

        expect(stored(LOG_KEY)).toMatchObject({ baseHash: hashDraftBase(loaded) })
      })

      it('새 글은 기준 해시 없이 임시 저장한다', async () => {
        const user = setup()
        await renderEditor()

        await user.type(screen.getByLabelText('제목'), 'JPA')
        advance(500)

        expect(stored(NEW_KEY)).toMatchObject({ baseHash: null })
      })

      it('수정을 저장한 뒤에는 새로 저장된 값의 해시가 기준이 된다', async () => {
        updateMutate.mockImplementationOnce((_vars, options?: { onSuccess?: () => void }) => options?.onSuccess?.())
        const user = setup()
        await renderEditor(log)
        await user.type(screen.getByLabelText('제목'), ' 보강')
        await user.click(screen.getByRole('button', { name: '저장' }))

        await user.type(screen.getByLabelText('제목'), '!')
        advance(500)

        expect(stored(LOG_KEY)).toMatchObject({
          title: 'JPA 정리 보강!',
          baseHash: hashDraftBase({ ...loaded, title: 'JPA 정리 보강' }),
        })
      })
    })

    it('공백이 섞인 제목과 빈 공부 시간으로 저장해도 서버에 저장된 값의 해시가 기준이 된다', async () => {
      createMutate.mockImplementationOnce((_vars, options?: { onSuccess?: (created: { id: number }) => void }) => options?.onSuccess?.({ id: 7 }))
      const user = setup()
      await renderEditor()
      await user.type(screen.getByLabelText('제목'), '  JPA 정리  ')
      await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
      await user.click(screen.getByRole('button', { name: '저장' }))

      await user.type(screen.getByLabelText('제목'), '!')
      advance(500)

      expect(stored('study-log-draft:v1:7:7')).toMatchObject({
        baseHash: hashDraftBase({ title: 'JPA 정리', content: 'JPA 공부', minutesInput: '0' }),
      })
    })

    describe('이탈 시점 저장', () => {
      const hideTab = () => {
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
        document.dispatchEvent(new Event('visibilitychange'))
      }

      it('입력 직후 500ms가 지나기 전에 화면이 사라져도 마지막 입력을 남긴다', async () => {
        const user = setup()
        const { unmount } = await renderEditor(log)
        await user.type(screen.getByLabelText('제목'), ' 보강')
        expect(stored(LOG_KEY)).toBeNull()

        unmount()

        expect(stored(LOG_KEY)).toMatchObject({ title: 'JPA 정리 보강', baseHash: expect.any(String) })
      })

      it('변경이 없으면 화면이 사라져도 아무것도 쓰지 않는다', async () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const { unmount } = await renderEditor(log)

        unmount()

        expect(setItem.mock.calls.filter(([key]) => String(key).startsWith('study-log-draft'))).toEqual([])
        expect(stored(LOG_KEY)).toBeNull()
      })

      it('복원 안내가 떠 있으면 화면이 사라져도 저장된 임시 글을 덮어쓰지 않는다', async () => {
        const draft = { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', baseHash: null, savedAt }
        store(NEW_KEY, draft)
        const user = setup()
        const { unmount } = await renderEditor()
        await user.type(screen.getByLabelText('제목'), '새로 입력')

        unmount()

        expect(stored(NEW_KEY)).toEqual(draft)
      })

      it('나가기를 확인해 버린 글은 화면이 사라질 때 다시 저장하지 않는다', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        const user = setup()
        const { unmount } = await renderEditor(log)
        await user.type(screen.getByLabelText('제목'), ' 보강')

        await user.click(screen.getByRole('button', { name: '목록으로' }))
        unmount()

        expect(stored(LOG_KEY)).toBeNull()
      })

      it('버린 뒤 다시 고치면 화면이 사라질 때 저장한다', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        const user = setup()
        const { unmount } = await renderEditor(log)
        await user.type(screen.getByLabelText('제목'), ' 보강')
        await user.click(screen.getByRole('button', { name: '목록으로' }))
        await user.type(screen.getByLabelText('제목'), '!')

        unmount()

        expect(stored(LOG_KEY)).toMatchObject({ title: 'JPA 정리 보강!' })
      })

      it('삭제에 성공한 뒤 화면이 사라져도 임시 글을 다시 저장하지 않는다', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        deleteMutate.mockImplementationOnce((_id, options?: { onSuccess?: () => void }) => options?.onSuccess?.())
        const user = setup()
        const { unmount } = await renderEditor(log)
        await user.type(screen.getByLabelText('제목'), ' 보강')

        await user.click(screen.getByRole('button', { name: '삭제' }))
        unmount()

        expect(stored(LOG_KEY)).toBeNull()
      })

      it('새 글을 처음 저장한 직후 화면이 사라져도 이전 새 글 키에는 쓰지 않는다', async () => {
        createMutate.mockImplementationOnce((_data, options?: { onSuccess?: (created: StudyLog) => void }) =>
          options?.onSuccess?.({ ...log, id: 7 }))
        const user = setup()
        const { unmount } = await renderEditor()
        await user.type(screen.getByLabelText('제목'), 'JPA 정리')
        await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
        await user.click(screen.getByRole('button', { name: '저장' }))

        unmount()

        expect(stored(NEW_KEY)).toBeNull()
        expect(stored('study-log-draft:v1:7:7')).toBeNull()
      })

      it('페이지가 숨겨지는 pagehide에는 500ms를 기다리지 않고 바로 저장한다', async () => {
        const user = setup()
        await renderEditor(log)
        await user.type(screen.getByLabelText('제목'), ' 보강')
        expect(stored(LOG_KEY)).toBeNull()

        window.dispatchEvent(new Event('pagehide'))

        expect(stored(LOG_KEY)).toMatchObject({ title: 'JPA 정리 보강' })
      })

      it('탭이 hidden이 되면 바로 저장하고, visible일 때는 저장하지 않는다', async () => {
        const user = setup()
        await renderEditor(log)
        await user.type(screen.getByLabelText('제목'), ' 보강')

        document.dispatchEvent(new Event('visibilitychange'))
        expect(stored(LOG_KEY)).toBeNull()

        hideTab()
        expect(stored(LOG_KEY)).toMatchObject({ title: 'JPA 정리 보강' })
      })

      it('변경이 없으면 pagehide와 hidden에도 저장하지 않는다', async () => {
        await renderEditor(log)

        window.dispatchEvent(new Event('pagehide'))
        hideTab()

        expect(stored(LOG_KEY)).toBeNull()
      })

      it('복원 안내가 떠 있으면 pagehide에도 저장하지 않는다', async () => {
        const draft = { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', baseHash: null, savedAt }
        store(NEW_KEY, draft)
        const user = setup()
        await renderEditor()
        await user.type(screen.getByLabelText('제목'), '새로 입력')

        window.dispatchEvent(new Event('pagehide'))

        expect(stored(NEW_KEY)).toEqual(draft)
      })

      it('로그인 정보가 없으면 pagehide와 화면 이탈에도 저장하지 않는다', async () => {
        localStorage.clear()
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const user = setup()
        const { unmount } = await renderEditor()
        await user.type(screen.getByLabelText('제목'), 'JPA')

        window.dispatchEvent(new Event('pagehide'))
        unmount()

        expect(setItem.mock.calls.filter(([key]) => String(key).startsWith('study-log-draft'))).toEqual([])
      })
    })

    it('글을 삭제하면 임시 글을 지운다', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      deleteMutate.mockImplementationOnce((_id, options?: { onSuccess?: () => void }) => options?.onSuccess?.())
      const user = setup()
      await renderEditor(log)
      await user.type(screen.getByLabelText('제목'), ' 보강')
      advance(500)
      expect(stored(LOG_KEY)).not.toBeNull()

      await user.click(screen.getByRole('button', { name: '삭제' }))
      advance(1000)

      expect(stored(LOG_KEY)).toBeNull()
    })

    it('저장하지 않은 변경을 버리고 나가면 임시 글을 지운다', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const user = setup()
      await renderEditor(log)
      await user.type(screen.getByLabelText('제목'), ' 보강')
      advance(500)
      expect(stored(LOG_KEY)).not.toBeNull()

      await user.click(screen.getByRole('button', { name: '목록으로' }))

      expect(stored(LOG_KEY)).toBeNull()
    })

    it('나가기를 취소하면 임시 글을 남긴다', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const user = setup()
      await renderEditor(log)
      await user.type(screen.getByLabelText('제목'), ' 보강')
      advance(500)

      await user.click(screen.getByRole('button', { name: '목록으로' }))

      expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
      expect(stored(LOG_KEY)).toMatchObject({ title: 'JPA 정리 보강' })
    })

    it('복원 안내를 고르지 않은 채 나가기를 확인해도 이전 임시 글은 남긴다', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const draft = { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', baseHash: null, savedAt }
      store(NEW_KEY, draft)
      const user = setup()
      const { unmount } = await renderEditor()
      await user.type(screen.getByLabelText('제목'), '새로 입력')

      await user.click(screen.getByRole('button', { name: '목록으로' }))
      unmount()

      expect(stored(NEW_KEY)).toEqual(draft)
    })

    it('저장에 실패하면(성공 콜백이 불리지 않으면) 임시 글을 지우지 않는다', async () => {
      const user = setup()
      await renderEditor(log)
      await user.type(screen.getByLabelText('제목'), ' 보강')
      advance(500)

      await user.click(screen.getByRole('button', { name: '저장' }))
      advance(1000)

      expect(updateMutate).toHaveBeenCalled()
      expect(stored(LOG_KEY)).toMatchObject({ title: 'JPA 정리 보강' })
    })

    it('새 글 저장에 실패해도 임시 글을 지우지 않는다', async () => {
      const user = setup()
      await renderEditor()
      await user.type(screen.getByLabelText('제목'), 'JPA 정리')
      await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
      advance(500)

      await user.click(screen.getByRole('button', { name: '저장' }))
      advance(1000)

      expect(createMutate).toHaveBeenCalled()
      expect(stored(NEW_KEY)).toMatchObject({ title: 'JPA 정리', content: 'JPA 공부' })
    })

    it('탭을 닫거나 새로고침해도 임시 글을 지우지 않는다', async () => {
      const user = setup()
      await renderEditor(log)
      await user.type(screen.getByLabelText('제목'), ' 보강')
      advance(500)

      window.dispatchEvent(new Event('beforeunload', { cancelable: true }))

      expect(stored(LOG_KEY)).not.toBeNull()
    })

    it('다른 사용자의 임시 글은 불러오지도 덮어쓰지도 않는다', async () => {
      const others = { title: '남의 글', content: '남의 내용', minutesInput: '10', savedAt }
      store('study-log-draft:v1:8:1', others)
      const user = setup()
      await renderEditor(log)

      expect(screen.queryByRole('region', { name: '임시 저장된 글' })).not.toBeInTheDocument()

      await user.type(screen.getByLabelText('제목'), ' 보강')
      advance(500)

      expect(stored('study-log-draft:v1:8:1')).toEqual(others)
      expect(stored(LOG_KEY)).toMatchObject({ title: 'JPA 정리 보강' })
    })
  })
})
