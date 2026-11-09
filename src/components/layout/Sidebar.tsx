import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, FileText, Calendar, MessageSquareText, BookOpen, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import SidebarUser from './SidebarUser'

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/companies', label: '회사', icon: Building2 },
  { to: '/applications', label: '지원 현황', icon: FileText },
  { to: '/schedules', label: '일정', icon: Calendar },
  { to: '/reviews', label: '내 면접 기록', icon: MessageSquareText },
  { to: '/study-logs', label: '학습 기록', icon: BookOpen },
  { to: '/mypage', label: '마이페이지', icon: UserRound },
]

export default function Sidebar() {
  return (
    <aside className="w-full md:w-60 md:min-h-screen bg-slate-900 text-white flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
      {/* Brand mark */}
      <div className="px-5 pt-4 pb-3 md:pt-7 md:pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <img src="/brand/mark-dark.svg" alt="" className="w-7 h-7" />
          <span className="text-base font-bold tracking-tight text-white/90">쌍떡잎</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-row gap-0.5 overflow-x-auto px-3 py-2 md:flex-col md:overflow-visible md:pt-4 md:pb-0 md:flex-1">
        <p className="hidden md:block text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500 px-2 mb-2">
          메뉴
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex shrink-0 items-center gap-3 whitespace-nowrap px-3 py-2.5 rounded-md text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-white/[0.07] text-white'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                <span
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-white transition-opacity duration-150',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon
                  size={15}
                  strokeWidth={1.75}
                  className={cn(
                    'shrink-0 transition-colors duration-150',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300',
                  )}
                />
                <span className="font-medium tracking-[0.01em]">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 md:py-4 border-t border-slate-800">
        <SidebarUser />
      </div>
    </aside>
  )
}
