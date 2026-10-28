import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, FileText, Calendar, MessageSquareText } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/companies', label: '회사', icon: Building2 },
  { to: '/applications', label: '지원 현황', icon: FileText },
  { to: '/schedules', label: '일정', icon: Calendar },
  { to: '/reviews', label: '후기', icon: MessageSquareText },
]

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800">
      {/* Brand mark */}
      <div className="px-5 pt-7 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-[2px] bg-white/80" />
          </div>
          <span className="text-[13px] font-semibold tracking-[0.08em] uppercase text-white/90 font-mono">
            Job Tracker
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500 px-2 mb-2">
          메뉴
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 group',
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
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-[11px] text-slate-600 tracking-wide">장명수 · 구직 추적</p>
      </div>
    </aside>
  )
}
