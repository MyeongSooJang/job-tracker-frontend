import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import Applications from '../Applications'

vi.mock('@/hooks/useApplications', () => ({
  useApplications: () => ({
    data: [{ id: 1, company: { id: 1, name: '카카오', industry: 'IT', website: '', createdAt: '' }, position: '백엔드', status: 'RESUME_SUBMITTED', appliedDate: '2026-10-01', createdAt: '' }],
    isLoading: false,
  }),
  useCreateApplication: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateApplicationStatus: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/useCompanies', () => ({
  useCompanies: () => ({ data: [{ id: 1, name: '카카오' }], isLoading: false }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
)

describe('Applications', () => {
  it('지원 목록을 렌더링한다', () => {
    render(<Applications />, { wrapper })
    expect(screen.getByText('카카오')).toBeInTheDocument()
    expect(screen.getByText('백엔드')).toBeInTheDocument()
  })

  it('다음 단계가 있는 지원 건에 상태 변경 드롭다운을 보여준다', () => {
    render(<Applications />, { wrapper })
    expect(screen.getByRole('combobox', { name: '상태 변경' })).toBeInTheDocument()
  })
})
