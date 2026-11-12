import { useState } from 'react'
import { useUpdateApplicationDeadline, useUpdateApplicationResumeView } from '@/hooks/useApplications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addOneMonth, resumeViewLabel } from '@/lib/application'
import type { Application, ResumeView } from '@/api/types'

export default function ApplicationPostingSection({ application }: { application: Application }) {
  const { mutate: updateDeadline, isPending: deadlinePending } = useUpdateApplicationDeadline(application.id)
  const { mutate: updateResumeView, isPending: viewPending } = useUpdateApplicationResumeView(application.id)
  const [deadline, setDeadline] = useState(application.deadline ?? '')

  const nextView: ResumeView = application.resumeView === 'VIEWED' ? 'NOT_VIEWED' : 'VIEWED'
  const canSaveDeadline = deadline !== '' && deadline !== application.deadline
  // 자동 불합격은 서류접수 상태이고 마감일이 있는 건만 대상이다.
  const pendingDeadline = application.status === 'RESUME_SUBMITTED' ? application.deadline : null

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <span className="text-slate-500">열람 여부</span>
        <div className="flex items-center gap-2">
          <p className="font-medium">{resumeViewLabel(application.resumeView)}</p>
          <Button
            variant="outline"
            size="sm"
            disabled={viewPending}
            onClick={() => updateResumeView(nextView)}
          >
            {nextView === 'VIEWED' ? '열람으로 표시' : '미열람으로 표시'}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="posting-deadline">공고 마감일</Label>
        <div className="flex items-center gap-2">
          <Input
            id="posting-deadline"
            type="date"
            className="w-48"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Button
            size="sm"
            disabled={!canSaveDeadline || deadlinePending}
            onClick={() => updateDeadline(deadline)}
          >
            마감일 저장
          </Button>
        </div>
        {pendingDeadline && (
          <p className="text-slate-500">
            {addOneMonth(pendingDeadline)}까지 결과가 없으면 다음 날 오전 7시(KST)에 자동으로 불합격 처리됩니다.
          </p>
        )}
        {application.autoRejectedAt && (
          <p className="text-slate-500">
            {application.autoRejectedAt.slice(0, 10)}에 자동으로 불합격 처리되었습니다.
          </p>
        )}
      </div>
    </div>
  )
}
