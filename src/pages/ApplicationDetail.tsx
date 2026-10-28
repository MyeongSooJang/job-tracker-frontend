import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApplication, useUpdateApplicationStatus } from '@/hooks/useApplications'
import InterviewMemo from '@/components/reviews/InterviewMemo'
import PassScheduleDialog from '@/components/schedules/PassScheduleDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ACTION_LABELS, NEXT_STATUSES, STATUS_LABELS } from '@/lib/status'

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const appId = Number(id)
  const { data: application, isLoading, isError } = useApplication(appId)
  const { mutate: updateStatus, isPending: updating } = useUpdateApplicationStatus(appId)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  if (isLoading || !application) return <div className="text-slate-500">불러오는 중...</div>
  if (isError) return <div className="text-red-500 p-4">데이터를 불러오지 못했습니다.</div>

  const nextStatuses = NEXT_STATUSES[application.status]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/applications" className="hover:underline">지원 현황</Link>
        <span>/ 상세</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{application.company.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">직무</span>
              <p className="font-medium">{application.position}</p>
            </div>
            <div>
              <span className="text-slate-500">지원일</span>
              <p className="font-medium">{application.appliedDate}</p>
            </div>
            <div>
              <span className="text-slate-500">현재 상태</span>
              <p className="font-medium">{STATUS_LABELS[application.status]}</p>
            </div>
          </div>

          {nextStatuses.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-2">상태 변경</p>
              <div className="flex gap-2 flex-wrap">
                {nextStatuses.map(s => (
                  <Button
                    key={s}
                    variant={s === 'REJECTED' ? 'destructive' : 'default'}
                    size="sm"
                    disabled={updating}
                    onClick={() => (s === 'INTERVIEW' ? setScheduleOpen(true) : updateStatus(s))}
                  >
                    {ACTION_LABELS[s]}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <InterviewMemo applicationId={appId} />

      {scheduleOpen && (
        <PassScheduleDialog
          applicationId={appId}
          companyName={application.company.name}
          onClose={() => setScheduleOpen(false)}
        />
      )}
    </div>
  )
}
