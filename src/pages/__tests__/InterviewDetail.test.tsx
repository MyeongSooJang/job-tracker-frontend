import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import InterviewDetail from '../InterviewDetail'

vi.mock('@/hooks/useInterviews', () => ({
  useInterviews: () => ({
    data: [{
      id: 1, round: 1, interviewDate: '2026-11-01T10:00:00', location: '판교',
      note: '1차 면접', questions: [{ id: 1, question: '자기소개', answer: '저는...', memo: '' }],
    }],
    isLoading: false,
  }),
  useAddQuestion: () => ({ mutate: vi.fn(), isPending: false }),
  useEvaluateInterview: () => ({ mutate: vi.fn(), isPending: false }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}>
    <MemoryRouter initialEntries={['/applications/1/interviews/1']}>
      <Routes><Route path="/applications/:applicationId/interviews/:interviewId" element={children} /></Routes>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('InterviewDetail', () => {
  it('면접 질문을 렌더링한다', () => {
    render(<InterviewDetail />, { wrapper })
    expect(screen.getByText('자기소개')).toBeInTheDocument()
  })
})
