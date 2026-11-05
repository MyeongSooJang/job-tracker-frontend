import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfirmEmailVerification, useSendEmailVerification } from '@/hooks/useAuthMutations'
import { getErrorMessage } from '@/lib/errors'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60

interface Props {
  email: string
  verified: boolean
  onEmailChange: (email: string) => void
  onVerified: () => void
  onReset: () => void
}

export default function EmailVerificationField({ email, verified, onEmailChange, onVerified, onReset }: Props) {
  const send = useSendEmailVerification()
  const confirm = useConfirmEmailVerification()
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const restart = () => {
    setSent(false)
    setCode('')
    setSecondsLeft(0)
    send.reset()
    confirm.reset()
  }

  const handleEmailChange = (value: string) => {
    onEmailChange(value)
    restart()
  }

  const handleReset = () => {
    restart()
    onReset()
  }

  const handleSend = () =>
    send.mutate({ email }, {
      onSuccess: () => {
        setSent(true)
        setCode('')
        setSecondsLeft(RESEND_COOLDOWN_SECONDS)
        confirm.reset()
      },
    })

  // 인증이 끝나면 쓴 코드 입력 상태를 비워, 나중에 인증 단계로 돌아와도 처음부터 시작하게 한다.
  const handleConfirm = () =>
    confirm.mutate({ email, code }, {
      onSuccess: () => {
        restart()
        onVerified()
      },
    })

  if (verified) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-ink-900">이메일</Label>
        <div className="flex gap-2">
          <Input id="email" type="email" value={email} readOnly />
          <Button type="button" variant="outline" onClick={handleReset} className="shrink-0">변경</Button>
        </div>
        <p className="text-sm text-brand-600">이메일 인증이 완료되었습니다.</p>
      </div>
    )
  }

  const message = send.error
    ? getErrorMessage(send.error, '인증 코드를 보내지 못했습니다. 잠시 후 다시 시도해주세요.')
    : confirm.error
      ? getErrorMessage(confirm.error, '인증 코드를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.')
      : null

  const sendLabel = send.isPending
    ? '발송 중...'
    : !sent ? '인증 코드 받기' : secondsLeft > 0 ? `재발송 (${secondsLeft}초)` : '재발송'

  return (
    <div className="space-y-1.5">
      <Label htmlFor="email" className="text-ink-900">이메일</Label>
      <div className="flex gap-2">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => handleEmailChange(e.target.value)}
          required
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSend}
          disabled={!email || send.isPending || secondsLeft > 0}
          className="shrink-0"
        >
          {sendLabel}
        </Button>
      </div>
      {sent && (
        <div className="flex gap-2 pt-1">
          <Label htmlFor="verification-code" className="sr-only">인증 코드</Label>
          <Input
            id="verification-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            placeholder={`인증 코드 ${CODE_LENGTH}자리`}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <Button
            type="button"
            variant="brand"
            onClick={handleConfirm}
            disabled={code.length !== CODE_LENGTH || confirm.isPending}
            className="shrink-0"
          >
            {confirm.isPending ? '확인 중...' : '확인'}
          </Button>
        </div>
      )}
      {message && <p role="alert" className="text-sm text-danger">{message}</p>}
    </div>
  )
}
