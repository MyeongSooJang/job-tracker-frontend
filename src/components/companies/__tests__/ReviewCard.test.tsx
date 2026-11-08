import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ReviewCard from '../ReviewCard'
import type { CompanyReview } from '@/api/types'

const base: CompanyReview = {
  id: 1,
  rating: 4,
  content: '면접관이 친절했어요',
  position: '백엔드',
  stage: 'ACCEPTED',
  createdAt: '2026-10-20T00:00:00',
}

describe('ReviewCard', () => {
  it('전형 결과와 직무, 내용을 보여준다', () => {
    render(<ReviewCard review={base} />)

    expect(screen.getByText('최종합격')).toBeInTheDocument()
    expect(screen.getByText('백엔드')).toBeInTheDocument()
    expect(screen.getByText('면접관이 친절했어요')).toBeInTheDocument()
  })

  it('난이도, 분위기, 지원 경로가 있으면 칩으로 보여준다', () => {
    render(
      <ReviewCard
        review={{ ...base, difficulty: 4, atmosphere: 'TENSE', route: 'REFERRAL' }}
      />,
    )

    expect(screen.getByRole('img', { name: '난이도 4/5 어려움' })).toBeInTheDocument()
    expect(screen.getByText('분위기 경직')).toBeInTheDocument()
    expect(screen.getByText('지인 추천')).toBeInTheDocument()
  })

  it('받은 질문은 개수와 함께 목록으로 보여준다', () => {
    render(<ReviewCard review={{ ...base, questions: ['자기소개', '트랜잭션 격리 수준'] }} />)

    expect(screen.getByText('받은 질문 2개')).toBeInTheDocument()
    expect(screen.getByText('트랜잭션 격리 수준')).toBeInTheDocument()
  })

  it('면접 상세가 없는 예전 후기는 칩과 질문 영역 없이 보여준다', () => {
    render(<ReviewCard review={{ ...base, difficulty: null, atmosphere: null, route: null }} />)

    expect(screen.queryByRole('img', { name: /난이도/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/분위기/)).not.toBeInTheDocument()
    expect(screen.queryByText(/받은 질문/)).not.toBeInTheDocument()
  })
})
