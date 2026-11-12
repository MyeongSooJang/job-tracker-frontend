import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeAll, describe, it, expect, vi } from 'vitest'
import Applications from '../Applications'

const updateMutate = vi.hoisted(() =>
  vi.fn((_status: string, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.()),
)

const createMutate = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useApplications', () => ({
  useApplications: () => ({
    data: [
      { id: 1, company: { id: 1, name: '카카오', industry: 'IT', website: '', createdAt: '' }, position: '백엔드', status: 'RESUME_SUBMITTED', appliedDate: '2026-10-01', jobSite: 'SARAMIN', deadline: '2026-10-31', resumeView: 'VIEWED', autoRejectedAt: null, createdAt: '' },
      { id: 2, company: { id: 2, name: '네이버', industry: 'IT', website: '', createdAt: '' }, position: '프론트엔드', status: 'RESUME_SUBMITTED', appliedDate: '2026-09-01', jobSite: null, deadline: '2026-09-15', resumeView: 'NOT_VIEWED', autoRejectedAt: null, createdAt: '' },
      { id: 3, company: { id: 3, name: '토스', industry: 'IT', website: '', createdAt: '' }, position: '서버', status: 'REJECTED', appliedDate: '2026-08-01', jobSite: 'WANTED', deadline: null, resumeView: 'NOT_VIEWED', autoRejectedAt: '2026-11-11T07:00:00', createdAt: '' },
    ],
    isLoading: false,
  }),
  useCreateApplication: () => ({ mutate: createMutate, isPending: false }),
  useUpdateApplicationStatus: () => ({ mutate: updateMutate, isPending: false }),
}))

vi.mock('@/hooks/useCompanies', () => ({
  useCompanies: () => ({ data: [{ id: 1, name: '카카오' }], isLoading: false }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
)

// Radix Select가 jsdom에서 열리도록 브라우저 API를 보정한다.
beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
})

async function pickOption(trigger: HTMLElement, optionName: string) {
  await userEvent.click(trigger)
  await userEvent.click(await screen.findByRole('option', { name: optionName }))
}

// 회사 선택 상자는 접근 가능한 이름이 없어 첫 번째 combobox로 찾는다.
const companySelect = () => screen.getAllByRole('combobox')[0]
const jobSiteSelect = () => screen.getByRole('combobox', { name: '지원 사이트' })

describe('Applications', () => {
  it('지원 목록에 지원한 사이트를 보여주고 이전 지원 건은 대시로 보여준다', () => {
    render(<Applications />, { wrapper })
    expect(within(screen.getByRole('row', { name: /카카오/ })).getByText('사람인')).toBeInTheDocument()
    expect(within(screen.getByRole('row', { name: /네이버/ })).getByText('-')).toBeInTheDocument()
  })

  it('회사, 직무, 지원일, 사이트를 모두 입력하면 선택한 사이트와 함께 등록한다', async () => {
    createMutate.mockClear()
    render(<Applications />, { wrapper })
    await userEvent.click(screen.getByRole('button', { name: '지원 등록' }))
    await pickOption(companySelect(), '카카오')
    await userEvent.type(screen.getByLabelText('직무 *'), '백엔드')
    await userEvent.type(screen.getByLabelText('지원일 *'), '2026-11-01')
    await pickOption(jobSiteSelect(), '자사 홈페이지')

    await userEvent.click(screen.getByRole('button', { name: '등록' }))

    expect(createMutate).toHaveBeenCalledWith(
      { companyId: 1, position: '백엔드', appliedDate: '2026-11-01', jobSite: 'COMPANY_WEBSITE' },
      expect.anything(),
    )
  })

  it('지원 사이트를 고르지 않으면 등록할 수 없다', async () => {
    render(<Applications />, { wrapper })
    await userEvent.click(screen.getByRole('button', { name: '지원 등록' }))
    await pickOption(companySelect(), '카카오')
    await userEvent.type(screen.getByLabelText('직무 *'), '백엔드')
    await userEvent.type(screen.getByLabelText('지원일 *'), '2026-11-01')

    expect(screen.getByRole('button', { name: '등록' })).toBeDisabled()
  })

  it('사이트를 고르면 그 사이트로 지원한 건만 보여준다', async () => {
    render(<Applications />, { wrapper })

    await pickOption(screen.getByRole('combobox', { name: '지원 사이트 필터' }), '사람인')

    expect(screen.getByRole('row', { name: /카카오/ })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /네이버/ })).not.toBeInTheDocument()
    expect(screen.getByText('1건 · 사람인')).toBeInTheDocument()
  })

  it('미지정을 고르면 사이트를 채우지 않은 이전 지원 건만 보여준다', async () => {
    render(<Applications />, { wrapper })

    await pickOption(screen.getByRole('combobox', { name: '지원 사이트 필터' }), '미지정')

    expect(screen.getByRole('row', { name: /네이버/ })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /카카오/ })).not.toBeInTheDocument()
  })

  it('상태 버튼과 사이트 필터는 함께 적용된다', async () => {
    render(<Applications />, { wrapper })
    await pickOption(screen.getByRole('combobox', { name: '지원 사이트 필터' }), '사람인')

    await userEvent.click(screen.getByRole('button', { name: '최종합격' }))

    expect(screen.queryByRole('row', { name: /카카오/ })).not.toBeInTheDocument()
    expect(screen.getByText('0건 · 사람인')).toBeInTheDocument()
  })

  it('지원 목록을 렌더링한다', () => {
    render(<Applications />, { wrapper })
    expect(screen.getByText('카카오')).toBeInTheDocument()
    expect(screen.getByText('백엔드')).toBeInTheDocument()
  })

  it('다음 단계가 있는 지원 건에 상태 변경 버튼을 보여준다', () => {
    render(<Applications />, { wrapper })
    const row = within(screen.getByRole('row', { name: /카카오/ }))
    expect(row.getByRole('button', { name: '→ 서류합격' })).toBeInTheDocument()
    expect(row.getByRole('button', { name: '→ 불합격' })).toBeInTheDocument()
  })

  it('서류합격으로 변경하면 면접 일정 등록 창을 띄운다', async () => {
    render(<Applications />, { wrapper })
    const row = within(screen.getByRole('row', { name: /카카오/ }))
    await userEvent.click(row.getByRole('button', { name: '→ 서류합격' }))
    expect(await screen.findByText('서류합격 — 면접 일정 등록')).toBeInTheDocument()
    expect(screen.getByLabelText('제목 *')).toHaveValue('카카오 면접')
  })

  it('불합격으로 변경하면 일정 등록 창을 띄우지 않는다', async () => {
    render(<Applications />, { wrapper })
    const row = within(screen.getByRole('row', { name: /카카오/ }))
    await userEvent.click(row.getByRole('button', { name: '→ 불합격' }))
    expect(screen.queryByText('서류합격 — 면접 일정 등록')).not.toBeInTheDocument()
  })

  it('지원 목록에 공고 마감일과 열람 여부를 보여준다', () => {
    render(<Applications />, { wrapper })
    const row = within(screen.getByRole('row', { name: /카카오/ }))
    expect(row.getByText('2026-10-31')).toBeInTheDocument()
    expect(row.getByText('열람')).toBeInTheDocument()
    expect(within(screen.getByRole('row', { name: /네이버/ })).getByText('미열람')).toBeInTheDocument()
  })

  it('마감일을 모르는 지원 건은 대시로 보여준다', () => {
    render(<Applications />, { wrapper })
    expect(within(screen.getByRole('row', { name: /토스/ })).getByText('-')).toBeInTheDocument()
  })

  it('자동으로 불합격된 지원 건에만 자동 표시를 붙인다', () => {
    render(<Applications />, { wrapper })
    expect(within(screen.getByRole('row', { name: /토스/ })).getByText('자동')).toBeInTheDocument()
    expect(within(screen.getByRole('row', { name: /카카오/ })).queryByText('자동')).not.toBeInTheDocument()
  })

  it('공고 마감일을 입력하면 마감일과 함께 등록한다', async () => {
    createMutate.mockClear()
    render(<Applications />, { wrapper })
    await userEvent.click(screen.getByRole('button', { name: '지원 등록' }))
    await pickOption(companySelect(), '카카오')
    await userEvent.type(screen.getByLabelText('직무 *'), '백엔드')
    await userEvent.type(screen.getByLabelText('지원일 *'), '2026-11-01')
    await pickOption(jobSiteSelect(), '사람인')
    await userEvent.type(screen.getByLabelText('공고 마감일'), '2026-11-30')

    await userEvent.click(screen.getByRole('button', { name: '등록' }))

    expect(createMutate).toHaveBeenCalledWith(
      { companyId: 1, position: '백엔드', appliedDate: '2026-11-01', jobSite: 'SARAMIN', deadline: '2026-11-30' },
      expect.anything(),
    )
  })
})
