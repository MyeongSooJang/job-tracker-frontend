import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '../Dashboard'

vi.mock('@/hooks/useApplications', () => ({
  useApplications: () => ({
    data: [
      { id: 1, company: { name: '카카오' }, position: '백엔드', status: 'RESUME_SUBMITTED', appliedDate: '2026-10-01', createdAt: '' },
      { id: 2, company: { name: '네이버' }, position: '백엔드', status: 'ACCEPTED', appliedDate: '2026-10-05', createdAt: '' },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/hooks/useSchedules', () => ({
  useSchedules: () => ({ data: [], isLoading: false }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
)

describe('Dashboard', () => {
  it('전체 지원 건수를 표시한다', () => {
    render(<Dashboard />, { wrapper })
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('최종합격 건수를 표시한다', () => {
    render(<Dashboard />, { wrapper })
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
