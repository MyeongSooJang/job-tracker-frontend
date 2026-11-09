import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useProfile } from '@/hooks/useProfile'

// 프로필 조회(react-query)는 로그인 상태에서만 마운트되는 하위 컴포넌트에서 한다.
function LoggedInUser({ onLogout }: { onLogout: () => void }) {
  const { data: profile } = useProfile()

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="truncate text-[12px] text-white/80">{profile?.name ?? '내 계정'}</p>
      <button
        type="button"
        onClick={onLogout}
        aria-label="로그아웃"
        className="flex shrink-0 items-center gap-1 text-[11px] text-white/55 hover:text-white/90 transition-colors"
      >
        <LogOut size={12} aria-hidden /> 로그아웃
      </button>
    </div>
  )
}

export default function SidebarUser() {
  const { isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <Link to="/login" className="text-[12px] text-white/60 hover:text-white/90 transition-colors">
        로그인
      </Link>
    )
  }
  return <LoggedInUser onLogout={logout} />
}
