import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import JobSitePassRate from '../JobSitePassRate'
import type { JobSiteStat } from '@/lib/jobSiteStats'

const stats: JobSiteStat[] = [
  { jobSite: 'SARAMIN', applicationCount: 10, documentPassedCount: 3, documentPassRate: 0.3 },
  { jobSite: 'WANTED', applicationCount: 4, documentPassedCount: 3, documentPassRate: 0.75 },
  { jobSite: 'JOBKOREA', applicationCount: 6, documentPassedCount: 0, documentPassRate: 0 },
]

describe('JobSitePassRate', () => {
  it('합격률이 높은 사이트부터 한 줄씩 보여준다', () => {
    render(<JobSitePassRate stats={stats} />)

    const rows = screen.getAllByRole('listitem')

    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveTextContent('Wanted')
    expect(rows[1]).toHaveTextContent('사람인')
    expect(rows[2]).toHaveTextContent('잡코리아')
  })

  it('비율과 함께 합격 건수/지원 건수를 보여준다', () => {
    render(<JobSitePassRate stats={stats} />)

    const saramin = screen.getAllByRole('listitem')[1]

    expect(within(saramin).getByText('30%')).toBeInTheDocument()
    expect(within(saramin).getByText('3/10건')).toBeInTheDocument()
  })

  it('막대는 합격률을 meter 값으로 노출한다', () => {
    render(<JobSitePassRate stats={stats} />)

    const meter = screen.getByRole('meter', { name: 'Wanted 서류 합격률' })

    expect(meter).toHaveAttribute('aria-valuenow', '75')
    expect(meter).toHaveAttribute('aria-valuetext', '4건 중 3건, 75%')
  })

  it('합격이 없는 사이트도 0%로 보여준다', () => {
    render(<JobSitePassRate stats={stats} />)

    const jobkorea = screen.getAllByRole('listitem')[2]

    expect(within(jobkorea).getByText('0%')).toBeInTheDocument()
    expect(within(jobkorea).getByText('0/6건')).toBeInTheDocument()
  })

  it('통계가 없으면 안내 문구를 보여준다', () => {
    render(<JobSitePassRate stats={[]} />)

    expect(screen.getByText('지원 내역이 없습니다.')).toBeInTheDocument()
    expect(screen.queryByRole('meter')).not.toBeInTheDocument()
  })
})
