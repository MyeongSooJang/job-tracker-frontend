import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ReviewForm from '../ReviewForm'
import type { Review } from '@/api/types'

const writeMutate = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useReviews', () => ({
  useWriteReview: () => ({ mutate: writeMutate, isPending: false }),
}))

const emptyReview: Review = {
  id: 7,
  application: {
    id: 1,
    company: { id: 1, name: '카카오', industry: 'IT', website: '', createdAt: '' },
    position: '백엔드',
    status: 'INTERVIEW',
    appliedDate: '2026-10-01',
    createdAt: '',
  },
  content: null,
  rating: null,
  createdAt: '2026-10-28T10:00:00',
  updatedAt: '2026-10-28T10:00:00',
}

const renderForm = (review: Review = emptyReview) =>
  render(
    <ReviewForm
      review={review}
      subject="카카오"
      contentLabel="카카오 후기"
      contentPlaceholder="후기를 남겨 보세요."
      saveLabel="저장"
    />,
  )

const group = (name: string) => within(screen.getByRole('group', { name }))

beforeEach(() => {
  writeMutate.mockClear()
})

describe('ReviewForm', () => {
  it('저장하면 회사 상세에 익명으로 공개된다는 점을 알려 준다', () => {
    renderForm()

    expect(screen.getByText(/익명으로 공개/)).toBeInTheDocument()
  })

  it('후기를 입력하고 평점을 고르기 전에는 저장할 수 없다', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText('카카오 후기'), '분위기가 좋았다')

    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('후기와 평점만 입력하면 면접 상세는 비워서 전송한다', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText('카카오 후기'), '분위기가 좋았다')
    await userEvent.click(screen.getByRole('button', { name: '4점' }))
    await userEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(writeMutate).toHaveBeenCalledWith({
      id: 7,
      data: {
        content: '분위기가 좋았다',
        rating: 4,
        difficulty: null,
        atmosphere: null,
        route: null,
        questions: [],
      },
    })
  })

  it('난이도, 분위기, 지원 경로, 받은 질문을 함께 전송한다', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText('카카오 후기'), '분위기가 좋았다')
    await userEvent.click(screen.getByRole('button', { name: '4점' }))
    await userEvent.click(group('난이도').getByRole('button', { name: '어려움' }))
    await userEvent.click(group('분위기').getByRole('button', { name: '경직' }))
    await userEvent.click(group('지원 경로').getByRole('button', { name: '지인 추천' }))
    await userEvent.type(screen.getByLabelText('카카오 받은 질문'), '자기소개{enter}  트랜잭션 격리 수준  ')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(writeMutate).toHaveBeenCalledWith({
      id: 7,
      data: {
        content: '분위기가 좋았다',
        rating: 4,
        difficulty: 4,
        atmosphere: 'TENSE',
        route: 'REFERRAL',
        questions: ['자기소개', '트랜잭션 격리 수준'],
      },
    })
  })

  it('이미 고른 선택지를 다시 누르면 선택이 해제된다', async () => {
    renderForm()
    const hard = group('난이도').getByRole('button', { name: '어려움' })

    await userEvent.click(hard)
    expect(hard).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(hard)

    expect(hard).toHaveAttribute('aria-pressed', 'false')
  })

  it('저장된 면접 상세를 폼에 복원하고 바꾸기 전에는 저장할 수 없다', () => {
    renderForm({
      ...emptyReview,
      content: '분위기가 좋았다',
      rating: 3,
      difficulty: 4,
      atmosphere: 'TENSE',
      route: 'REFERRAL',
      questions: ['자기소개'],
    })

    expect(group('난이도').getByRole('button', { name: '어려움' })).toHaveAttribute('aria-pressed', 'true')
    expect(group('분위기').getByRole('button', { name: '경직' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('카카오 받은 질문')).toHaveValue('자기소개')
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })
})
