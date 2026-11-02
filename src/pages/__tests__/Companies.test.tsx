import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi } from 'vitest'
import Companies from '../Companies'

const makeCompany = (id: number, name: string, industry = 'IT') => ({
  id,
  name,
  industry,
  website: '',
  createdAt: '',
  // 짝수 id만 후기가 있다.
  reviewCount: id % 2 === 0 ? id : 0,
  averageRating: id % 2 === 0 ? 4.5 : null,
})

// 회사 10개: 한 페이지 8개 기준으로 2페이지가 된다.
const companies = [
  makeCompany(1, '카카오'),
  makeCompany(2, '네이버'),
  makeCompany(3, '쿠팡', '커머스'),
  ...Array.from({ length: 7 }, (_, i) => makeCompany(i + 4, `회사${i + 4}`)),
]

vi.mock('@/hooks/useCompanies', () => ({
  useCompanies: () => ({ data: companies, isLoading: false }),
  useCreateCompany: () => ({ mutate: vi.fn(), isPending: false, error: null, reset: vi.fn() }),
}))

const qc = new QueryClient()
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
)

describe('Companies', () => {
  it('회사 카드를 렌더링하고 상세 페이지로 연결한다', () => {
    render(<Companies />, { wrapper })
    const link = screen.getByRole('link', { name: /카카오/ })
    expect(link).toHaveAttribute('href', '/companies/1')
  })

  it('회사 등록 버튼이 존재한다', () => {
    render(<Companies />, { wrapper })
    expect(screen.getByRole('button', { name: /회사 등록/ })).toBeInTheDocument()
  })

  it('한 페이지에 8개만 보여주고 다음 페이지로 넘어간다', async () => {
    const user = userEvent.setup()
    render(<Companies />, { wrapper })
    expect(screen.getAllByRole('link')).toHaveLength(8)
    expect(screen.queryByText('회사10')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '2페이지' }))
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByText('회사10')).toBeInTheDocument()
  })

  it('검색어로 회사명을 필터링한다', async () => {
    const user = userEvent.setup()
    render(<Companies />, { wrapper })
    await user.type(screen.getByRole('searchbox', { name: '회사 검색' }), '네이')
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByText('네이버')).toBeInTheDocument()
  })

  it('업종으로도 검색된다', async () => {
    const user = userEvent.setup()
    render(<Companies />, { wrapper })
    await user.type(screen.getByRole('searchbox', { name: '회사 검색' }), '커머스')
    expect(screen.getByText('쿠팡')).toBeInTheDocument()
    expect(screen.queryByText('카카오')).not.toBeInTheDocument()
  })

  it('2페이지에서 검색하면 1페이지로 돌아간다', async () => {
    const user = userEvent.setup()
    render(<Companies />, { wrapper })
    await user.click(screen.getByRole('button', { name: '2페이지' }))
    await user.type(screen.getByRole('searchbox', { name: '회사 검색' }), '카카오')
    expect(screen.getByText('카카오')).toBeInTheDocument()
  })

  it('검색 결과가 없으면 안내 문구를 보여준다', async () => {
    const user = userEvent.setup()
    render(<Companies />, { wrapper })
    await user.type(screen.getByRole('searchbox', { name: '회사 검색' }), '없는회사')
    expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument()
  })

  it('후기가 있으면 평균 별점과 후기 수를, 없으면 안내를 보여준다', () => {
    render(<Companies />, { wrapper })
    expect(screen.getAllByText('4.5').length).toBeGreaterThan(0)
    expect(screen.getByText('후기 2개')).toBeInTheDocument()
    expect(screen.getAllByText('아직 후기가 없어요').length).toBeGreaterThan(0)
  })
})
