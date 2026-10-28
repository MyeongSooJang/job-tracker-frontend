import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApplication, useUpdateApplicationStatus } from '@/hooks/useApplications'
import { useInterviews, useCreateInterview } from '@/hooks/useInterviews'
import PassScheduleDialog from '@/components/schedules/PassScheduleDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ACTION_LABELS, NEXT_STATUSES, STATUS_LABELS } from '@/lib/status'

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()
  const appId = Number(id)
  const { data: application, isLoading, isError } = useApplication(appId)
  const { mutate: updateStatus, isPending: updating } = useUpdateApplicationStatus(appId)
  const { data: interviews = [] } = useInterviews(appId)
  const { mutate: createInterview, isPending: creating } = useCreateInterview(appId)
  const [open, setOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [form, setForm] = useState({ round: '', interviewDate: '', location: '', note: '' })

  if (isLoading || !application) return <div className="text-slate-500">불러오는 중...</div>
  if (isError) return <div className="text-red-500 p-4">데이터를 불러오지 못했습니다.</div>

  const nextStatuses = NEXT_STATUSES[application.status]

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) setForm({ round: '', interviewDate: '', location: '', note: '' })
  }

  const handleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createInterview(
      {
        round: Number(form.round),
        interviewDate: form.interviewDate + ':00',
        location: form.location,
        note: form.note,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setForm({ round: '', interviewDate: '', location: '', note: '' })
        },
      },
    )
  }

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

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">면접 기록</h2>
        {application.status === 'INTERVIEW' && (
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size="sm">면접 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>면접 등록</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInterviewSubmit} className="space-y-4">
              <div>
                <Label htmlFor="round">면접 회차 *</Label>
                <Input
                  id="round"
                  type="number"
                  min="1"
                  value={form.round}
                  onChange={e => setForm(f => ({ ...f, round: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="interviewDate">면접 일시 *</Label>
                <Input
                  id="interviewDate"
                  type="datetime-local"
                  value={form.interviewDate}
                  onChange={e => setForm(f => ({ ...f, interviewDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="note">메모</Label>
                <Textarea
                  id="note"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? '등록 중...' : '등록'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {interviews.length === 0 ? (
          <p className="text-slate-400 text-sm">등록된 면접이 없습니다.</p>
        ) : (
          interviews.map(interview => (
            <Card key={interview.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{interview.round}차 면접</p>
                    <p className="text-sm text-slate-500">
                      {new Date(interview.interviewDate).toLocaleString('ko-KR')} · {interview.location}
                    </p>
                  </div>
                  <Link to={`/applications/${appId}/interviews/${interview.id}`}>
                    <Button variant="outline" size="sm">질문/답변 보기</Button>
                  </Link>
                </div>
                {interview.note && (
                  <p className="mt-2 text-sm text-slate-600">{interview.note}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  질문 {interview.questions?.length ?? 0}개
                  {interview.score != null && ` · 점수 ${interview.score}점`}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
