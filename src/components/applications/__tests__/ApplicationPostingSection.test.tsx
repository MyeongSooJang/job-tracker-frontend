import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ApplicationPostingSection from '../ApplicationPostingSection'
import type { Application } from '@/api/types'

const updateDeadline = vi.hoisted(() => vi.fn())
const updateResumeView = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useApplications', () => ({
  useUpdateApplicationDeadline: () => ({ mutate: updateDeadline, isPending: false }),
  useUpdateApplicationResumeView: () => ({ mutate: updateResumeView, isPending: false }),
}))

const base: Application = {
  id: 1,
  company: { id: 1, name: '카카오', industry: 'IT', website: '', createdAt: '' },
  position: '백엔드',
  status: 'RESUME_SUBMITTED',
  appliedDate: '2026-10-01',
  createdAt: '',
  jobSite: 'SARAMIN',
  deadline: '2026-10-10',
  resumeView: 'NOT_VIEWED',
  autoRejectedAt: null,
}

describe('ApplicationPostingSection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('열람 여부와 마감일을 보여준다', () => {
    render(<ApplicationPostingSection application={base} />)

    expect(screen.getByText('미열람')).toBeInTheDocument()
    expect(screen.getByLabelText('공고 마감일')).toHaveValue('2026-10-10')
  })

  it('미열람 지원은 열람으로 표시하면 열람으로 바꾼다', async () => {
    render(<ApplicationPostingSection application={base} />)

    await userEvent.click(screen.getByRole('button', { name: '열람으로 표시' }))

    expect(updateResumeView).toHaveBeenCalledWith('VIEWED')
  })

  it('열람 지원은 미열람으로 표시하는 버튼을 보여준다', async () => {
    render(<ApplicationPostingSection application={{ ...base, resumeView: 'VIEWED' }} />)

    await userEvent.click(screen.getByRole('button', { name: '미열람으로 표시' }))

    expect(updateResumeView).toHaveBeenCalledWith('NOT_VIEWED')
  })

  it('마감일을 바꿔 저장하면 새 마감일로 수정을 요청한다', async () => {
    render(<ApplicationPostingSection application={base} />)
    const input = screen.getByLabelText('공고 마감일')

    await userEvent.clear(input)
    await userEvent.type(input, '2026-11-20')
    await userEvent.click(screen.getByRole('button', { name: '마감일 저장' }))

    expect(updateDeadline).toHaveBeenCalledWith('2026-11-20')
  })

  it('마감일을 바꾸지 않으면 저장 버튼을 누를 수 없다', () => {
    render(<ApplicationPostingSection application={base} />)

    expect(screen.getByRole('button', { name: '마감일 저장' })).toBeDisabled()
  })

  it('마감일이 없는 지원은 마감일을 입력해 저장할 수 있다', async () => {
    render(<ApplicationPostingSection application={{ ...base, deadline: null }} />)

    await userEvent.type(screen.getByLabelText('공고 마감일'), '2026-11-20')
    await userEvent.click(screen.getByRole('button', { name: '마감일 저장' }))

    expect(updateDeadline).toHaveBeenCalledWith('2026-11-20')
  })

  it('서류접수 상태에 마감일이 있으면 자동 불합격 기준일을 안내한다', () => {
    render(<ApplicationPostingSection application={base} />)

    expect(screen.getByText(/2026-11-10까지 결과가 없으면/)).toBeInTheDocument()
  })

  it('마감일이 없으면 자동 불합격 안내를 보여주지 않는다', () => {
    render(<ApplicationPostingSection application={{ ...base, deadline: null }} />)

    expect(screen.queryByText(/까지 결과가 없으면/)).not.toBeInTheDocument()
  })

  it('이미 불합격한 지원에는 자동 불합격 예정 안내를 보여주지 않는다', () => {
    render(<ApplicationPostingSection application={{ ...base, status: 'REJECTED' }} />)

    expect(screen.queryByText(/까지 결과가 없으면/)).not.toBeInTheDocument()
  })

  it('자동으로 불합격된 지원은 처리된 날짜를 안내한다', () => {
    render(
      <ApplicationPostingSection
        application={{ ...base, status: 'REJECTED', autoRejectedAt: '2026-11-11T07:00:00' }}
      />,
    )

    expect(screen.getByText(/2026-11-11에 자동으로 불합격 처리되었습니다/)).toBeInTheDocument()
  })
})
