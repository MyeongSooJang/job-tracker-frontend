import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import InterviewCalendar from './InterviewCalendar'
import type { Schedule } from '@/api/types'

const now = new Date()
const iso = (day: number) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T14:00:00`

const make = (id: number, type: Schedule['type'], company: string): Schedule => ({
  id,
  application: { id, company: { name: company } } as Schedule['application'],
  title: `${company} 일정`,
  scheduledAt: iso(15),
  type,
  address: '서울',
  note: '',
})

describe('InterviewCalendar', () => {
  it('면접 일정만 표시한다', () => {
    render(
      <MemoryRouter>
        <InterviewCalendar schedules={[make(1, 'INTERVIEW', '카카오'), make(2, 'TASK', '네이버')]} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/카카오/)).toBeInTheDocument()
    expect(screen.queryByText(/네이버/)).not.toBeInTheDocument()
  })

  it('다음 달로 이동하면 이번 달 일정이 사라진다', () => {
    render(
      <MemoryRouter>
        <InterviewCalendar schedules={[make(1, 'INTERVIEW', '카카오')]} />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByLabelText('다음 달'))
    expect(screen.queryByText(/카카오/)).not.toBeInTheDocument()
  })
})
