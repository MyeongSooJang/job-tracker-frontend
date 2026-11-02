import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Schedules from '../Schedules'

const DAY_MS = 24 * 60 * 60 * 1000
const application = { id: 1, company: { name: '카카오' }, position: '백엔드', status: 'INTERVIEW', appliedDate: '', createdAt: '' }

vi.mock('@/hooks/useSchedules', () => ({
  useSchedules: () => ({
    data: [
      { id: 1, title: '1차 면접', application, scheduledAt: new Date(Date.now() + DAY_MS).toISOString(), type: 'INTERVIEW', note: '' },
      { id: 2, title: '지난 면접', application, scheduledAt: new Date(Date.now() - DAY_MS).toISOString(), type: 'INTERVIEW', note: '' },
    ],
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

  it('지난 일정은 목록에 표시하지 않는다', () => {
    render(<Schedules />, { wrapper })
    expect(screen.queryByText('지난 면접')).not.toBeInTheDocument()
  })
})
