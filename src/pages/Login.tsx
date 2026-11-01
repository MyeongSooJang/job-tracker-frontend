import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuthMutations'
import { useAuth } from '@/components/auth/AuthProvider'
import AuthLayout from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage } from '@/lib/errors'

export default function Login() {
  const { mutate: login, isPending, error } = useLogin()
  const { login: saveToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/mypage'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(form, {
      onSuccess: ({ accessToken }) => {
        saveToken(accessToken)
        navigate(redirectTo, { replace: true })
      },
    })
  }

  return (
    <AuthLayout
      title="로그인"
      description="이메일로 로그인하고 내 정보를 관리하세요."
      footer={<>아직 계정이 없으신가요? <Link to="/signup" className="font-semibold text-brand-600 hover:underline">회원가입</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-ink-900">이메일</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-ink-900">비밀번호</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {getErrorMessage(error, '로그인하지 못했습니다. 잠시 후 다시 시도해주세요.')}
          </p>
        )}
        <Button type="submit" variant="brand" disabled={isPending} className="w-full">
          {isPending ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    </AuthLayout>
  )
}
