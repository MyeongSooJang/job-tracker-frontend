import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Reviews from '../Reviews'

const writeMutate = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useReviews', () => ({
  useReviews: () => ({
    data: [
      {
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
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useWriteReview: () => ({ mutate: writeMutate, isPending: false }),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Reviews', () => {
  it('자동 생성된 후기를 작성 전 상태로 보여준다', () => {
    render(<Reviews />, { wrapper })
    expect(screen.getByText('카카오')).toBeInTheDocument()
    expect(screen.getByText('작성 전')).toBeInTheDocument()
  })

  it('후기를 입력하고 평점을 고르기 전에는 저장할 수 없다', async () => {
    render(<Reviews />, { wrapper })
    const save = screen.getByRole('button', { name: '저장' })

    await userEvent.type(screen.getByLabelText('카카오 후기'), '분위기가 좋았다')

    expect(save).toBeDisabled()
  })

  it('후기와 평점을 입력하고 저장하면 내용과 평점을 전송한다', async () => {
    render(<Reviews />, { wrapper })
    const save = screen.getByRole('button', { name: '저장' })

    await userEvent.type(screen.getByLabelText('카카오 후기'), '분위기가 좋았다')
    await userEvent.click(screen.getByRole('button', { name: '4점' }))
    await userEvent.click(save)

    expect(writeMutate).toHaveBeenCalledWith({ id: 7, data: { content: '분위기가 좋았다', rating: 4 } })
  })
})
