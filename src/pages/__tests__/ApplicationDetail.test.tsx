import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import ApplicationDetail from '../ApplicationDetail'

vi.mock('@/hooks/useApplications', () => ({
  useApplication: () => ({
    data: { id: 1, company: { name: '카카오' }, position: '백엔드', status: 'RESUME_SUBMITTED', appliedDate: '2026-10-01', createdAt: '' },
    isLoading: false,
  }),
  useUpdateApplicationStatus: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/useReviews', () => ({
  useReviews: () => ({ data: [], isLoading: false }),
  useWriteReview: () => ({ mutate: vi.fn(), isPending: false }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}>
    <MemoryRouter initialEntries={['/applications/1']}>
      <Routes><Route path="/applications/:id" element={children} /></Routes>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('ApplicationDetail', () => {
  it('회사명과 직무를 렌더링한다', () => {
    render(<ApplicationDetail />, { wrapper })
    expect(screen.getByText('카카오')).toBeInTheDocument()
    expect(screen.getByText('백엔드')).toBeInTheDocument()
  })
})
