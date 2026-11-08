import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CompanyDetail from '../CompanyDetail'

const company = {
  id: 1,
  name: '카카오',
  industry: 'IT',
  website: 'https://kakao.com',
  createdAt: '',
  reviewCount: 2,
  averageRating: 4.5,
}

const reviews = [
  { id: 1, rating: 5, content: '면접관이 친절했어요', position: '백엔드', stage: 'ACCEPTED', createdAt: '2026-10-20T00:00:00' },
  { id: 2, rating: 4, content: 'CS 위주 질문', position: '프론트', stage: 'REJECTED', createdAt: '2026-10-10T00:00:00' },
]

const useCompany = vi.fn()
const useCompanyReviews = vi.fn()

vi.mock('@/hooks/useCompanies', () => ({
  useCompany: (...args: unknown[]) => useCompany(...args),
  useCompanyReviews: (...args: unknown[]) => useCompanyReviews(...args),
}))

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/companies/1']}>
      <Routes>
        <Route path="/companies/:id" element={<CompanyDetail />} />
      </Routes>
    </MemoryRouter>,
  )

beforeEach(() => {
  useCompany.mockReturnValue({ data: company, isLoading: false, isError: false })
  useCompanyReviews.mockReturnValue({ data: reviews, isLoading: false, isError: false })
})

describe('CompanyDetail', () => {
  it('회사 정보와 평균 별점, 후기 수를 보여준다', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: '카카오' })).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('후기 2개')).toBeInTheDocument()
  })

  it('평균 별점이 면접 경험 만족도의 평균임을 알려 준다', () => {
    renderPage()
    expect(screen.getByText('평균 면접 경험 만족도')).toBeInTheDocument()
  })

  it('후기가 5건 미만이면 참고용이라고 안내한다', () => {
    renderPage()
    expect(screen.getByText('후기가 적어 참고용이에요')).toBeInTheDocument()
  })

  it('후기가 5건 이상이면 참고용 안내를 하지 않는다', () => {
    useCompany.mockReturnValue({
      data: { ...company, reviewCount: 5 },
      isLoading: false,
      isError: false,
    })
    renderPage()
    expect(screen.queryByText('후기가 적어 참고용이에요')).not.toBeInTheDocument()
  })

  it('홈페이지를 새 탭 링크로 연다', () => {
    renderPage()
    const link = screen.getByRole('link', { name: /홈페이지/ })
    expect(link).toHaveAttribute('href', 'https://kakao.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('후기 카드에 직무, 결과, 내용을 보여준다', () => {
    renderPage()
    expect(screen.getByText('면접관이 친절했어요')).toBeInTheDocument()
    expect(screen.getByText(/백엔드/)).toBeInTheDocument()
    expect(screen.getByText(/최종합격/)).toBeInTheDocument()
    expect(screen.getByText(/불합격/)).toBeInTheDocument()
  })

  it('회사 목록으로 돌아가는 링크가 있다', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /회사 목록/ })).toHaveAttribute('href', '/companies')
  })

  it('후기가 없으면 빈 상태를 보여준다', () => {
    useCompany.mockReturnValue({
      data: { ...company, reviewCount: 0, averageRating: null },
      isLoading: false,
      isError: false,
    })
    useCompanyReviews.mockReturnValue({ data: [], isLoading: false, isError: false })
    renderPage()
    expect(screen.getByText(/아직 등록된 후기가 없습니다/)).toBeInTheDocument()
  })

  it('불러오는 중에는 로딩 문구를 보여준다', () => {
    useCompany.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    renderPage()
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument()
  })

  it('오류가 나면 오류 문구를 보여준다', () => {
    useCompany.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    renderPage()
    expect(screen.getByText('데이터를 불러오지 못했습니다.')).toBeInTheDocument()
  })
})
