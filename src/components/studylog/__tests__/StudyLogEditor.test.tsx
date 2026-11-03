import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import StudyLogEditor from '../StudyLogEditor'

const saveMutate = vi.fn()
const deleteMutate = vi.fn()

vi.mock('@/hooks/useStudyLogs', () => ({
  useSaveStudyLog: () => ({ mutate: saveMutate, isPending: false, isSuccess: false, error: null, reset: vi.fn() }),
  useDeleteStudyLog: () => ({ mutate: deleteMutate, isPending: false, isSuccess: false, error: null, reset: vi.fn() }),
}))

const DATE = '2026-11-03'
const log = { id: 1, studyDate: DATE, content: '## JPA 정리', studyMinutes: 90 }

describe('StudyLogEditor', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('내용이 비어 있으면 저장할 수 없다', () => {
    render(<StudyLogEditor date={DATE} log={null} />)

    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('내용과 공부 시간을 입력하고 저장하면 해당 날짜로 저장을 요청한다', async () => {
    const user = userEvent.setup()
    render(<StudyLogEditor date={DATE} log={null} />)

    await user.type(screen.getByLabelText('공부 시간 (분)'), '90')
    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(saveMutate).toHaveBeenCalledWith({ date: DATE, data: { content: 'JPA 공부', studyMinutes: 90 } })
  })

  it('공부 시간을 비워 두면 0분으로 저장한다', async () => {
    const user = userEvent.setup()
    render(<StudyLogEditor date={DATE} log={null} />)

    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(saveMutate).toHaveBeenCalledWith({ date: DATE, data: { content: 'JPA 공부', studyMinutes: 0 } })
  })

  it('공부 시간이 1440분을 넘으면 안내하고 저장할 수 없다', async () => {
    const user = userEvent.setup()
    render(<StudyLogEditor date={DATE} log={null} />)

    await user.type(screen.getByLabelText('공부 시간 (분)'), '1441')
    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')

    expect(screen.getByText('0~1440 사이로 입력해주세요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('미리보기 탭에서는 마크다운이 렌더링된다', async () => {
    const user = userEvent.setup()
    render(<StudyLogEditor date={DATE} log={log} />)

    await user.click(screen.getByRole('tab', { name: '미리보기' }))

    expect(screen.getByRole('heading', { name: 'JPA 정리', level: 2 })).toBeInTheDocument()
  })

  it('저장된 기록이 있으면 내용과 공부 시간을 채우고 삭제 버튼을 보여준다', () => {
    render(<StudyLogEditor date={DATE} log={log} />)

    expect(screen.getByLabelText('공부한 내용')).toHaveValue('## JPA 정리')
    expect(screen.getByLabelText('공부 시간 (분)')).toHaveValue(90)
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
  })

  it('기록이 없으면 삭제 버튼이 없다', () => {
    render(<StudyLogEditor date={DATE} log={null} />)

    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
  })

  it('삭제를 확인하면 해당 날짜의 기록을 삭제한다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    render(<StudyLogEditor date={DATE} log={log} />)

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(deleteMutate).toHaveBeenCalledWith(DATE, expect.anything())
  })

  it('삭제에 성공하면 입력해 둔 내용과 공부 시간을 비운다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    deleteMutate.mockImplementationOnce((_date: string, options?: { onSuccess?: () => void }) => options?.onSuccess?.())
    const user = userEvent.setup()
    render(<StudyLogEditor date={DATE} log={log} />)

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(screen.getByLabelText('공부한 내용')).toHaveValue('')
    expect(screen.getByLabelText('공부 시간 (분)')).toHaveValue(null)
  })

  it('삭제를 취소하면 삭제하지 않는다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const user = userEvent.setup()
    render(<StudyLogEditor date={DATE} log={log} />)

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(deleteMutate).not.toHaveBeenCalled()
  })
})
