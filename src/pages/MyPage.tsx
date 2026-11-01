import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'
import ProfileSummaryCard from '@/components/mypage/ProfileSummaryCard'
import ProfileSection from '@/components/mypage/ProfileSection'
import ResumeCard from '@/components/mypage/ResumeCard'
import { PROFILE_SECTIONS } from '@/components/mypage/sections'

const RESUME_TAB = 'resume'

const TABS = [
  ...PROFILE_SECTIONS.map(section => ({ id: section.id as string, title: section.title, icon: section.icon })),
  { id: RESUME_TAB, title: '이력서', icon: FileText },
]

export default function MyPage() {
  const { data: profile, isLoading, isError } = useProfile()
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id)

  if (isLoading) return <div className="text-slate-500">불러오는 중...</div>
  if (isError || !profile) return <div className="text-red-500 p-4">프로필을 불러오지 못했습니다.</div>

  const activeSection = PROFILE_SECTIONS.find(section => section.id === activeTab)

  return (
    <div className="space-y-6 font-sans">
      <ProfileSummaryCard profile={profile} />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="마이페이지 메뉴"
          className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-white p-2 lg:flex-col lg:self-start"
        >
          {TABS.map(({ id, title, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                activeTab === id
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-600 hover:bg-surface hover:text-ink-900',
              )}
            >
              <Icon size={16} aria-hidden />
              {title}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {activeSection ? (
            <ProfileSection key={activeSection.id} section={activeSection} profile={profile} />
          ) : (
            <ResumeCard resume={profile.resume} />
          )}
        </div>
      </div>
    </div>
  )
}
