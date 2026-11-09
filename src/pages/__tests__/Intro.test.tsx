import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeEach } from 'vitest'
import { clearToken, setToken } from '@/lib/auth'
import { AuthProvider } from '@/components/auth/AuthProvider'
import Intro from '../Intro'

function LoginProbe() {
  const from = (useLocation().state as { from?: string } | null)?.from
  return <div>로그인 화면 from={from ?? '없음'}</div>
}

const renderIntro = (state?: { from: string }) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/intro', state }]}>
          <Routes>
            <Route path="/intro" element={<Intro />} />
            <Route path="/login" element={<LoginProbe />} />
            <Route path="/signup" element={<div>회원가입 화면</div>} />
            <Route path="/" element={<div>대시보드 화면</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )

describe('Intro', () => {
  beforeEach(() => clearToken())

  it('서비스 이름과 한 줄 소개, 핵심 기능 3가지를 보여준다', () => {
    renderIntro()

    expect(screen.getByRole('heading', { level: 1, name: '취업 준비의 기록을 한곳에' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '지원 현황 관리' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '면접 기록' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '학습 기록' })).toBeInTheDocument()
  })

  it('로그인하지 않았으면 로그인과 회원가입 링크를 보여준다', () => {
    renderIntro()

    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: '회원가입' })).toHaveAttribute('href', '/signup')
    expect(screen.queryByRole('link', { name: '내 화면으로 가기' })).not.toBeInTheDocument()
  })

  it('로그인 버튼은 원래 가려던 주소를 로그인 화면으로 넘긴다', async () => {
    const user = userEvent.setup()
    renderIntro({ from: '/study-logs?date=2026-11-10' })

    await user.click(screen.getByRole('link', { name: '로그인' }))

    expect(screen.getByText('로그인 화면 from=/study-logs?date=2026-11-10')).toBeInTheDocument()
  })

  it('원래 주소가 없으면 from 없이 로그인 화면으로 간다', async () => {
    const user = userEvent.setup()
    renderIntro()

    await user.click(screen.getByRole('link', { name: '로그인' }))

    expect(screen.getByText('로그인 화면 from=없음')).toBeInTheDocument()
  })

  it('로그인한 상태에서는 내 화면으로 가기 링크만 보여준다', async () => {
    setToken('jwt-token')
    const user = userEvent.setup()
    renderIntro()

    expect(screen.queryByRole('link', { name: '로그인' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '회원가입' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: '내 화면으로 가기' }))

    expect(screen.getByText('대시보드 화면')).toBeInTheDocument()
  })
})
