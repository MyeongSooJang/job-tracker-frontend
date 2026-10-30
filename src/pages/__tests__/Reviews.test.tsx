import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import Reviews from '../Reviews'

const company = { id: 1, name: '카카오', industry: 'IT', website: '', createdAt: '' }
const application = {
  id: 1, company, position: '백엔드 개발자', status: 'INTERVIEW_1' as const, appliedDate: '', createdAt: '',
}

vi.mock('@/hooks/useReviews', () => ({
  useReviews: () => ({
    data: [
      { id: 1, application, content: '분위기가 좋았다', rating: 4, createdAt: '', updatedAt: '' },
      { id: 2, application, content: null, rating: null, createdAt: '', updatedAt: '' },
    ],
    isLoading: false,
    isError: false,
  }),
  useWriteReview: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
)

describe('Reviews', () => {
  it('후기와 평점을 렌더링한다', () => {
    render(<Reviews />, { wrapper })

    expect(screen.getAllByText('카카오')).toHaveLength(2)
    expect(screen.getByText('분위기가 좋았다')).toBeInTheDocument()
    expect(screen.getByLabelText('평점 4점')).toBeInTheDocument()
  })

  it('작성 전 후기는 작성 버튼을, 작성된 후기는 수정 버튼을 보여준다', () => {
    render(<Reviews />, { wrapper })

    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '작성' })).toBeInTheDocument()
  })
})
