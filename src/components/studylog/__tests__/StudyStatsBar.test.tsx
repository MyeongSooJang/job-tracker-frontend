import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StudyStatsBar from '../StudyStatsBar'

describe('StudyStatsBar', () => {
  it('현재 연속, 최장 연속, 이번 달 작성일, 오늘 공부 시간을 보여준다', () => {
    render(<StudyStatsBar stats={{ currentStreak: 5, longestStreak: 21, monthWrittenDays: 9, todayMinutes: 200 }} />)

    expect(screen.getByText('현재 연속')).toBeInTheDocument()
    expect(screen.getByText('5일')).toBeInTheDocument()
    expect(screen.getByText('21일')).toBeInTheDocument()
    expect(screen.getByText('9일')).toBeInTheDocument()
    expect(screen.getByText('3시간 20분')).toBeInTheDocument()
  })

  it('오늘 아직 공부 시간이 없으면 0분으로 보여준다', () => {
    render(<StudyStatsBar stats={{ currentStreak: 0, longestStreak: 0, monthWrittenDays: 0, todayMinutes: 0 }} />)

    expect(screen.getByText('0분')).toBeInTheDocument()
  })
})
