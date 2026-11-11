import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { STATUS_LABELS } from '@/lib/status'
import { RECENT_VISIBLE } from '@/lib/recentApplications'
import type { Application, ApplicationStatus } from '@/api/types'

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  RESUME_SUBMITTED: 'border-slate-300 text-slate-600',
  INTERVIEW: 'border-brand-500 text-brand-700',
  ACCEPTED: 'border-success text-success-strong',
  REJECTED: 'border-rose-400 text-rose-600',
}

interface Props {
  // 기간 필터와 최신순 정렬이 끝난 목록
  applications: Application[]
  days: number
}

export default function RecentApplications({ applications, days }: Props) {
  const [expanded, setExpanded] = useState(false)
  const hiddenCount = applications.length - RECENT_VISIBLE
  const visible = expanded ? applications : applications.slice(0, RECENT_VISIBLE)

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-700">최근 지원 현황</CardTitle>
        <p className="text-xs text-slate-400">최근 {days}일 동안 지원한 건</p>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="py-2 text-sm text-slate-400">최근 {days}일 동안 지원한 내역이 없습니다.</p>
        ) : (
          <>
            <ul className="divide-y divide-slate-100">
              {visible.map(a => (
                <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-700">
                    <span className="font-medium">{a.company.name}</span>
                    <span className="ml-2 text-slate-400">— {a.position}</span>
                  </span>
                  <Badge variant="outline" className={`text-xs ${STATUS_BADGE_CLASS[a.status]}`}>
                    {STATUS_LABELS[a.status]}
                  </Badge>
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(prev => !prev)}
                aria-expanded={expanded}
                className="mt-2 w-full rounded-md py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              >
                {expanded ? '접기' : `더보기 (${hiddenCount}건)`}
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
