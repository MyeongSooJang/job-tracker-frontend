import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { StudyLog } from '@/api/types'
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
  render(
    <MemoryRouter>
      <StudyLogEditor date={DATE} log={existing} onCreated={onCreated} />
      <LocationProbe />
    </MemoryRouter>,
  )
  await screen.findByLabelText('공부한 내용')
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

    expect(confirm).toHaveBeenCalledWith('저장하지 않은 변경이 있어요. 나갈까요?')
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
    })
    afterEach(() => {
      vi.useRealTimers()
      localStorage.clear()
    })

    it('고친 내용은 500ms 동안 입력이 멈춘 뒤에 임시 저장한다', async () => {
      const user = setup()
      await renderEditor()

      await user.type(screen.getByLabelText('제목'), 'JPA')
      expect(stored(NEW_KEY)).toBeNull()

      advance(500)
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
      const user = setup()
      await renderEditor()

      await user.type(screen.getByLabelText('제목'), 'JPA')
      advance(1000)

      const draftCalls = [...getItem.mock.calls, ...setItem.mock.calls].filter(([key]) => String(key).startsWith('study-log-draft'))
      expect(draftCalls).toEqual([])
    })

    it('저장되지 않은 임시 글이 있으면 시각과 함께 안내한다', async () => {
      store(NEW_KEY, { title: '쓰던 글', content: '쓰던 내용', minutesInput: '45', savedAt })
      await renderEditor()

      const banner = screen.getByRole('region', { name: '임시 저장된 글' })
      expect(banner).toHaveTextContent('저장하지 않은 글이 있어요. 14:05에 임시 저장됐어요.')
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

      expect(stored(LOG_KEY)).not.toBeNull()
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
