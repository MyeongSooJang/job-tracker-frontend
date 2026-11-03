import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import type { StudyLog } from '@/api/types'
import StudyLogs from '../StudyLogs'

let dayLog: StudyLog | null = null

vi.mock('@/hooks/useStudyLogs', () => ({
  useStudyStats: () => ({ data: undefined, isError: false }),
  useMonthlyStudyLogs: () => ({ data: [] }),
  useRecentStudyLogs: () => ({ data: [] }),
  useStudyLog: () => ({ data: dayLog, isLoading: false, isError: false }),
  useSaveStudyLog: () => ({ mutate: vi.fn(), isPending: false, isSuccess: true, error: null, reset: vi.fn() }),
  useDeleteStudyLog: () => ({ mutate: vi.fn(), isPending: false, isSuccess: false, error: null, reset: vi.fn() }),
}))

describe('StudyLogs 페이지', () => {
  it('처음 저장해 기록이 생겨도 에디터가 다시 만들어지지 않아 입력과 저장 안내가 유지된다', async () => {
    const user = userEvent.setup()
    dayLog = null
    const { rerender } = render(<StudyLogs />)
    await user.type(screen.getByLabelText('공부한 내용'), 'JPA 공부')

    // 서버 내용을 일부러 다르게 둬서, 에디터가 다시 만들어지면 입력값이 서버 값으로 바뀌어 드러나게 한다.
    dayLog = { id: 1, studyDate: '2026-11-03', content: '서버가 돌려준 내용', studyMinutes: 0 }
    rerender(<StudyLogs />)

    expect(screen.getByLabelText('공부한 내용')).toHaveValue('JPA 공부')
    expect(screen.getByRole('status')).toHaveTextContent('저장했습니다.')
  })
})
