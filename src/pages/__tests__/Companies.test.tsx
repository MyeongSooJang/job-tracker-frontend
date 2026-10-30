import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import Companies from '../Companies'

vi.mock('@/hooks/useCompanies', () => ({
  useCompanies: () => ({
    data: [{ id: 1, name: '카카오', industry: 'IT', website: 'https://kakao.com', createdAt: '' }],
    isLoading: false,
  }),
  useCreateCompany: () => ({ mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
)

describe('Companies', () => {
  it('회사 목록을 렌더링한다', () => {
    render(<Companies />, { wrapper })
    expect(screen.getByText('카카오')).toBeInTheDocument()
  })

  it('회사 등록 버튼이 존재한다', () => {
    render(<Companies />, { wrapper })
    expect(screen.getByRole('button', { name: /회사 등록/ })).toBeInTheDocument()
  })
})
