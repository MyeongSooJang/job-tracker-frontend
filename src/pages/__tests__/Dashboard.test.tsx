import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import Dashboard from '../Dashboard'

const jobSiteStatsResult = vi.hoisted(() => ({
  value: {} as { data?: unknown; isError?: boolean },
}))

vi.mock('@/hooks/useApplications', () => ({
  useApplications: () => ({
    data: [
      { id: 1, company: { name: '카카오' }, position: '백엔드', status: 'RESUME_SUBMITTED', appliedDate: '2026-10-01', createdAt: '' },
      { id: 2, company: { name: '네이버' }, position: '백엔드', status: 'ACCEPTED', appliedDate: '2026-10-05', createdAt: '' },
    ],
    isLoading: false,
  }),
  useJobSiteStats: () => jobSiteStatsResult.value,
}))

vi.mock('@/hooks/useSchedules', () => ({
  useSchedules: () => ({ data: [], isLoading: false }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
)

describe('Dashboard', () => {
  beforeEach(() => {
    jobSiteStatsResult.value = {
      data: [{ jobSite: 'WANTED', applicationCount: 4, documentPassedCount: 3, documentPassRate: 0.75 }],
    }
  })

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

  it('면접 일정 달력은 대시보드에 보여주지 않는다', () => {
    render(<Dashboard />, { wrapper })
    expect(screen.queryByText('면접 일정 달력')).not.toBeInTheDocument()
  })

  describe('사이트별 서류 합격률', () => {
    it('합격률을 보여준다', () => {
      render(<Dashboard />, { wrapper })

      expect(screen.getByText('사이트별 서류 합격률')).toBeInTheDocument()
      expect(screen.getByRole('meter', { name: 'Wanted 서류 합격률' })).toHaveAttribute('aria-valuenow', '75')
    })

    it('불러오는 중이면 카드도 오류 문구도 보여주지 않는다', () => {
      jobSiteStatsResult.value = { data: undefined }

      render(<Dashboard />, { wrapper })

      expect(screen.queryByText('사이트별 서류 합격률')).not.toBeInTheDocument()
      expect(screen.queryByText('사이트별 서류 합격률을 불러오지 못했습니다.')).not.toBeInTheDocument()
    })

    it('합격률만 불러오지 못하면 그 자리에 안내하고 나머지 대시보드는 그대로 보여준다', () => {
      jobSiteStatsResult.value = { data: undefined, isError: true }

      render(<Dashboard />, { wrapper })

      expect(screen.getByText('사이트별 서류 합격률을 불러오지 못했습니다.')).toBeInTheDocument()
      expect(screen.getByText('전체 지원').parentElement!.parentElement).toHaveTextContent('2')
    })
  })
})
