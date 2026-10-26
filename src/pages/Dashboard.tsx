import { useApplications } from '@/hooks/useApplications'
import { useSchedules } from '@/hooks/useSchedules'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ApplicationStatus } from '@/api/types'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  RESUME_SUBMITTED: '서류접수',
  RESUME_PASSED: '서류합격',
  INTERVIEW_1: '1차면접',
  INTERVIEW_2: '2차면접',
  FINAL: '최종면접',
  ACCEPTED: '최종합격',
  REJECTED: '불합격',
}

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  RESUME_SUBMITTED: 'border-slate-300 text-slate-600',
  RESUME_PASSED: 'border-blue-300 text-blue-600',
  INTERVIEW_1: 'border-blue-400 text-blue-700',
  INTERVIEW_2: 'border-blue-500 text-blue-800',
  FINAL: 'border-violet-400 text-violet-700',
  ACCEPTED: 'border-emerald-400 text-emerald-700',
  REJECTED: 'border-rose-400 text-rose-600',
}

export default function Dashboard() {
  const { data: applications = [], isLoading: appsLoading } = useApplications()
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules()

  const accepted = applications.filter(a => a.status === 'ACCEPTED').length
  const rejected = applications.filter(a => a.status === 'REJECTED').length
  const inProgress = applications.length - accepted - rejected

  const upcoming = schedules
    .filter(s => new Date(s.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5)

  if (appsLoading || schedulesLoading) {
    return <div className="text-slate-500 p-8">불러오는 중...</div>
  }

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold text-slate-800">대시보드</h1>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">전체 지원</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">{applications.length}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm bg-blue-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">진행 중</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{inProgress}건</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm bg-emerald-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">최종합격</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{accepted}</p>
          </CardContent>
        </Card>

        <Card className="border-rose-100 shadow-sm bg-rose-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">불합격</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-rose-500">{rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* 다가오는 일정 */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700">다가오는 일정</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-slate-400 text-sm py-2">예정된 일정이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map(s => (
                <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium text-slate-700">
                    {s.title}
                    <span className="text-slate-400 font-normal ml-2">— {s.application.company.name}</span>
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {new Date(s.scheduledAt).toLocaleDateString('ko-KR')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 최근 지원 현황 */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700">최근 지원 현황</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-slate-400 text-sm py-2">지원 내역이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {applications.slice(0, 8).map(a => (
                <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-700">
                    <span className="font-medium">{a.company.name}</span>
                    <span className="text-slate-400 ml-2">— {a.position}</span>
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${STATUS_BADGE_CLASS[a.status]}`}
                  >
                    {STATUS_LABELS[a.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
