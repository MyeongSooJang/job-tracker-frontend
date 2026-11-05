import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignup } from '@/hooks/useAuthMutations'
import { useAuth } from '@/components/auth/AuthProvider'
import AuthLayout from '@/components/auth/AuthLayout'
import EmailVerificationField from '@/components/auth/EmailVerificationField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorCode, getErrorMessage } from '@/lib/errors'

const MIN_PASSWORD_LENGTH = 8

export default function Signup() {
  const { mutate: signup, isPending, error } = useSignup()
  const { login: saveToken } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', name: '', password: '', passwordConfirm: '' })
  const [emailVerified, setEmailVerified] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailVerified) {
      setFormError('이메일 인증을 완료해주세요.')
      return
    }
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`)
      return
    }
    if (form.password !== form.passwordConfirm) {
      setFormError('비밀번호가 일치하지 않습니다.')
      return
    }
    setFormError(null)
    signup(
      { email: form.email, name: form.name, password: form.password },
      {
        onSuccess: ({ accessToken }) => {
          saveToken(accessToken)
          navigate('/mypage', { replace: true })
        },
        // 인증 완료 후 10분이 지나면 서버가 거절하므로 인증 단계부터 다시 시작하게 한다.
        onError: e => {
          if (getErrorCode(e) === 'EMAIL_NOT_VERIFIED') setEmailVerified(false)
        },
      },
    )
  }

  const message = formError ?? (error ? getErrorMessage(error, '회원가입하지 못했습니다. 잠시 후 다시 시도해주세요.') : null)

  return (
    <AuthLayout
      title="회원가입"
      description="가입하고 이력서와 인적 사항을 한곳에서 관리하세요."
      footer={<>이미 계정이 있으신가요? <Link to="/login" className="font-semibold text-brand-600 hover:underline">로그인</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <EmailVerificationField
          email={form.email}
          verified={emailVerified}
          onEmailChange={email => setForm(f => ({ ...f, email }))}
          onVerified={() => setEmailVerified(true)}
          onReset={() => { setEmailVerified(false); setFormError(null) }}
        />
        {emailVerified && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-ink-900">이름</Label>
              <Input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-ink-900">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={`${MIN_PASSWORD_LENGTH}자 이상`}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="passwordConfirm" className="text-ink-900">비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                value={form.passwordConfirm}
                onChange={e => setForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                required
              />
            </div>
          </>
        )}
        {message && <p role="alert" className="text-sm text-danger">{message}</p>}
        <Button type="submit" variant="brand" disabled={isPending || !emailVerified} className="w-full">
          {isPending ? '가입 중...' : '회원가입'}
        </Button>
      </form>
    </AuthLayout>
  )
}
