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

  it('현재 연속이 0일이면 0일 대신 새싹이 돋는다는 문구와 씨앗을 보여준다', () => {
    render(<StudyStatsBar stats={{ currentStreak: 0, longestStreak: 4, monthWrittenDays: 2, todayMinutes: 0 }} />)

    expect(screen.getByText('오늘 기록하면 새싹이 돋아요')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '새싹 1단계 씨앗' })).toBeInTheDocument()
    expect(screen.getByText('4일')).toBeInTheDocument()
    expect(screen.queryByText('0일')).not.toBeInTheDocument()
  })

  it('연속 중이면 단계 이름과 다음 단계까지 남은 일수를 보여준다', () => {
    render(<StudyStatsBar stats={{ currentStreak: 25, longestStreak: 31, monthWrittenDays: 9, todayMinutes: 200 }} />)

    expect(screen.getByRole('img', { name: '새싹 3단계 쌍떡잎, 연속 25일' })).toBeInTheDocument()
    expect(screen.getByText('쌍떡잎')).toBeInTheDocument()
    expect(screen.getByText('5일 더 쓰면 본잎 단계예요')).toBeInTheDocument()
  })

  it('마지막 단계에서는 다음 단계 대신 활짝 피었다고 알려준다', () => {
    render(<StudyStatsBar stats={{ currentStreak: 50, longestStreak: 60, monthWrittenDays: 20, todayMinutes: 0 }} />)

    expect(screen.getByRole('img', { name: '새싹 6단계 꽃, 연속 50일' })).toBeInTheDocument()
    expect(screen.getByText('활짝 피었어요')).toBeInTheDocument()
  })
})
