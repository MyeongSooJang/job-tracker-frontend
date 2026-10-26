import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Sidebar from '../Sidebar'

describe('Sidebar', () => {
  it('네비게이션 링크를 렌더링한다', () => {
    render(<BrowserRouter><Sidebar /></BrowserRouter>)

    expect(screen.getByText('대시보드')).toBeInTheDocument()
    expect(screen.getByText('회사')).toBeInTheDocument()
    expect(screen.getByText('지원 현황')).toBeInTheDocument()
    expect(screen.getByText('일정')).toBeInTheDocument()
  })
})
