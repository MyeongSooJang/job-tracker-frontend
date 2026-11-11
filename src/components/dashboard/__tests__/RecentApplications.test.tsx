import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import RecentApplications from '../RecentApplications'
import type { Application } from '@/api/types'

const app = (id: number): Application => ({
  id,
  company: { id, name: `회사${id}`, industry: '', website: '', createdAt: '' },
  position: '백엔드',
  status: 'RESUME_SUBMITTED',
  appliedDate: '2026-11-10',
  jobSite: 'WANTED',
  createdAt: '',
})

const apps = (count: number) => Array.from({ length: count }, (_, i) => app(i + 1))

describe('RecentApplications', () => {
  it('5건까지는 더보기 없이 모두 보여준다', () => {
    render(<RecentApplications applications={apps(5)} days={7} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.queryByRole('button', { name: /더보기/ })).not.toBeInTheDocument()
  })

  it('5건을 넘으면 앞의 5건만 보여주고 남은 건수를 더보기에 표시한다', () => {
    render(<RecentApplications applications={apps(8)} days={7} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('회사5')).toBeInTheDocument()
    expect(screen.queryByText('회사6')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '더보기 (3건)' })).toBeInTheDocument()
  })

  it('더보기를 누르면 나머지를 모두 보여주고 접기로 바뀐다', async () => {
    render(<RecentApplications applications={apps(8)} days={7} />)

    await userEvent.click(screen.getByRole('button', { name: '더보기 (3건)' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(8)
    expect(screen.getByRole('button', { name: '접기' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('접기를 누르면 다시 5건만 보여준다', async () => {
    render(<RecentApplications applications={apps(8)} days={7} />)

    await userEvent.click(screen.getByRole('button', { name: '더보기 (3건)' }))
    await userEvent.click(screen.getByRole('button', { name: '접기' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })

  it('기간 안의 지원 건이 없으면 안내 문구를 보여준다', () => {
    render(<RecentApplications applications={[]} days={7} />)

    expect(screen.getByText('최근 7일 동안 지원한 내역이 없습니다.')).toBeInTheDocument()
  })
})
