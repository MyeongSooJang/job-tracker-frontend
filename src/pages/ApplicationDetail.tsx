import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useApplication,
  useUpdateApplicationJobSite,
  useUpdateApplicationStatus,
} from '@/hooks/useApplications'
import InterviewMemo from '@/components/reviews/InterviewMemo'
import PassScheduleDialog from '@/components/schedules/PassScheduleDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ACTION_LABELS, NEXT_STATUSES, STATUS_LABELS } from '@/lib/status'
import { JOB_SITES, JOB_SITE_LABELS } from '@/lib/jobSite'
import type { JobSite } from '@/api/types'

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const appId = Number(id)
  const { data: application, isLoading, isError } = useApplication(appId)
  const { mutate: updateStatus, isPending: updating } = useUpdateApplicationStatus(appId)
  const { mutate: updateJobSite, isPending: updatingJobSite } = useUpdateApplicationJobSite(appId)
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
            <div>
              <span className="text-slate-500">지원 사이트</span>
              <Select
                value={application.jobSite ?? ''}
                onValueChange={(v) => updateJobSite(v as JobSite)}
                disabled={updatingJobSite}
              >
                <SelectTrigger aria-label="지원 사이트" className="mt-1 w-48">
                  <SelectValue placeholder="미지정" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_SITES.map((site) => (
                    <SelectItem key={site} value={site}>
                      {JOB_SITE_LABELS[site]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
