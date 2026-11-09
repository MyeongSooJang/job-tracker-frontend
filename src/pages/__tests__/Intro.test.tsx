import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
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

// 화면 가운데에 들어온 영역을 흉내 내기 위해 IntersectionObserver를 가짜로 바꾼다.
let notifyIntersecting: (element: Element) => void

class FakeIntersectionObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    notifyIntersecting = element =>
      this.callback([{ isIntersecting: true, target: element } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }

  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('Intro', () => {
  beforeEach(() => {
    clearToken()
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('서비스 이름과 한 줄 소개, 기능 소개를 차례로 보여준다', () => {
    renderIntro()

    expect(screen.getByRole('heading', { level: 1, name: '쓴 만큼 자라요.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '어디까지 왔는지 한눈에' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '면접에서 받은 질문과 내 답변' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '다가오는 일정을 놓치지 않게' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '오늘 공부한 걸 글로 남겨요' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '오늘 한 줄부터.' })).toBeInTheDocument()
  })

  it('처음에는 씨앗 단계의 새싹과 연속 0일을 보여준다', () => {
    renderIntro()

    expect(screen.getByRole('img', { name: '새싹 1단계 씨앗' })).toBeInTheDocument()
    expect(screen.getByText('연속 0일 · 씨앗')).toBeInTheDocument()
  })

  it('스크롤로 글 영역이 화면 가운데에 오면 새싹이 그 단계로 자란다', () => {
    renderIntro()
    const section = screen.getByRole('heading', { level: 2, name: '다가오는 일정을 놓치지 않게' }).closest('section') as HTMLElement

    act(() => notifyIntersecting(section))

    expect(screen.getByText('연속 30일 · 본잎')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '새싹 4단계 본잎' })).toBeInTheDocument()
  })

  it('마지막 영역에서는 꽃이 핀 새싹을 보여준다', () => {
    renderIntro()
    const section = screen.getByRole('heading', { level: 2, name: '오늘 한 줄부터.' }).closest('section') as HTMLElement

    act(() => notifyIntersecting(section))

    expect(screen.getByText('연속 50일 · 꽃')).toBeInTheDocument()
  })

  it('IntersectionObserver가 없는 환경에서도 씨앗 단계로 그려진다', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    renderIntro()

    expect(screen.getByText('연속 0일 · 씨앗')).toBeInTheDocument()
  })

  it('로그인하지 않았으면 처음과 끝 두 곳에 로그인과 회원가입 링크를 보여준다', () => {
    renderIntro()

    const logins = screen.getAllByRole('link', { name: '로그인' })
    const signups = screen.getAllByRole('link', { name: '회원가입' })
    expect(logins).toHaveLength(2)
    expect(signups).toHaveLength(2)
    logins.forEach(link => expect(link).toHaveAttribute('href', '/login'))
    signups.forEach(link => expect(link).toHaveAttribute('href', '/signup'))
    expect(screen.queryByRole('link', { name: '내 화면으로 가기' })).not.toBeInTheDocument()
  })

  it('로그인 버튼은 원래 가려던 주소를 로그인 화면으로 넘긴다', async () => {
    const user = userEvent.setup()
    renderIntro({ from: '/study-logs?date=2026-11-10' })

    await user.click(screen.getAllByRole('link', { name: '로그인' })[0])

    expect(screen.getByText('로그인 화면 from=/study-logs?date=2026-11-10')).toBeInTheDocument()
  })

  it('원래 주소가 없으면 from 없이 로그인 화면으로 간다', async () => {
    const user = userEvent.setup()
    renderIntro()

    await user.click(screen.getAllByRole('link', { name: '로그인' })[1])

    expect(screen.getByText('로그인 화면 from=없음')).toBeInTheDocument()
  })

  it('로그인한 상태에서는 내 화면으로 가기 링크만 보여준다', async () => {
    setToken('jwt-token')
    const user = userEvent.setup()
    renderIntro()

    expect(screen.queryByRole('link', { name: '로그인' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '회원가입' })).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('link', { name: '내 화면으로 가기' })[0])

    expect(screen.getByText('대시보드 화면')).toBeInTheDocument()
  })
})
