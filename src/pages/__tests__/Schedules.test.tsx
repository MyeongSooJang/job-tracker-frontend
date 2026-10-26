import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Schedules from '../Schedules'

vi.mock('@/hooks/useSchedules', () => ({
  useSchedules: () => ({
    data: [{
      id: 1, title: '1차 면접',
      application: { id: 1, company: { name: '카카오' }, position: '백엔드', status: 'INTERVIEW_1', appliedDate: '', createdAt: '' },
      scheduledAt: '2026-11-01T10:00:00', type: 'INTERVIEW', note: '',
    }],
    isLoading: false,
  }),
  useCreateSchedule: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/useApplications', () => ({
  useApplications: () => ({ data: [{ id: 1, company: { name: '카카오' }, position: '백엔드' }], isLoading: false }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
)

describe('Schedules', () => {
  it('일정 목록을 렌더링한다', () => {
    render(<Schedules />, { wrapper })
    expect(screen.getByText('1차 면접')).toBeInTheDocument()
    expect(screen.getByText('카카오')).toBeInTheDocument()
  })
})
