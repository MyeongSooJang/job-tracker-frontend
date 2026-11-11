import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, it, expect, vi } from 'vitest'
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
    expect(screen.getByText('전체 지원').parentElement!.parentElement).toHaveTextContent('2')
  })

  it('최종합격 건수를 표시한다', () => {
    render(<Dashboard />, { wrapper })
    expect(screen.getAllByText('최종합격')[0].parentElement!.parentElement).toHaveTextContent('1')
  })

  describe('최근 지원 현황', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('최근 7일 안에 지원한 건만 보여준다', () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 9, 10)) // 네이버(10/5)는 5일 전, 카카오(10/1)는 9일 전

      render(<Dashboard />, { wrapper })

      const recent = screen.getByText('최근 지원 현황').closest('div[class*="rounded-lg"]') as HTMLElement
      expect(within(recent).getByText('네이버')).toBeInTheDocument()
      expect(within(recent).queryByText('카카오')).not.toBeInTheDocument()
    })

    it('기간 안의 지원 건이 없으면 안내 문구를 보여준다', () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 10, 30))

      render(<Dashboard />, { wrapper })

      expect(screen.getByText('최근 7일 동안 지원한 내역이 없습니다.')).toBeInTheDocument()
    })
  })
})
