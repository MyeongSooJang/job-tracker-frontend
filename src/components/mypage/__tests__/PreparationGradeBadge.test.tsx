import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PreparationGradeBadge from '../PreparationGradeBadge'

const today = new Date(2026, 10, 2) // 2026-11-02

describe('PreparationGradeBadge', () => {
  it.each([
    ['2026-09-02', '취준생', 2],
    ['2026-05-02', '도전하는 청년', 6],
    ['2025-11-02', '힘을내는 청년', 12],
    ['2025-05-02', '노력하는 청년', 18],
    ['2024-11-02', '꿈을꾸는 청년', 24],
  ])('시작일 %s이면 %s 등급과 준비 %i개월을 보여준다', (startDate, gradeName, months) => {
    render(<PreparationGradeBadge startDate={startDate} today={today} />)

    expect(screen.getByText(gradeName)).toBeInTheDocument()
    expect(screen.getByText(`준비 ${months}개월`)).toBeInTheDocument()
  })

  it('시작일이 없으면 안내 문구를 보여주고 등급은 보여주지 않는다', () => {
    render(<PreparationGradeBadge startDate={null} today={today} />)

    expect(screen.getByText(/준비 시작일을 입력하면 등급이 표시돼요/)).toBeInTheDocument()
    expect(screen.queryByText('취준생')).not.toBeInTheDocument()
  })

  it('안내의 입력 링크를 누르면 콜백을 호출한다', async () => {
    const onGoToInput = vi.fn()
    render(<PreparationGradeBadge startDate={null} onGoToInput={onGoToInput} />)

    await userEvent.setup().click(screen.getByRole('button', { name: '입력하러 가기' }))

    expect(onGoToInput).toHaveBeenCalledOnce()
  })
})
