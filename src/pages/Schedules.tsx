import { useState } from 'react'
import { useSchedules, useCreateSchedule } from '@/hooks/useSchedules'
import { useApplications } from '@/hooks/useApplications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { ScheduleType } from '@/api/types'

const TYPE_LABELS: Record<ScheduleType, string> = {
  INTERVIEW: '면접',
  DOCUMENT_SUBMISSION: '서류 제출',
  TASK: '과제',
  OTHER: '기타',
}

const TYPE_BADGE_VARIANTS: Record<ScheduleType, string> = {
  INTERVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
  DOCUMENT_SUBMISSION: 'bg-orange-100 text-orange-700 border-orange-200',
  TASK: 'bg-purple-100 text-purple-700 border-purple-200',
  OTHER: 'bg-slate-100 text-slate-700 border-slate-200',
}

export default function Schedules() {
  const { data: schedules = [], isLoading, isError } = useSchedules()
  const { data: applications = [] } = useApplications()
  const { mutate: createSchedule, isPending } = useCreateSchedule()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    applicationId: '',
    title: '',
    scheduledAt: '',
    type: '' as ScheduleType | '',
    address: '',
    note: '',
  })

  const sorted = [...schedules].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.applicationId || !form.type) return
    createSchedule(
      {
        applicationId: Number(form.applicationId),
        title: form.title,
        scheduledAt: form.scheduledAt + ':00',
        type: form.type as ScheduleType,
        address: form.address,
        note: form.note,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setForm({ applicationId: '', title: '', scheduledAt: '', type: '', address: '', note: '' })
        },
      },
    )
  }

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) setForm({ applicationId: '', title: '', scheduledAt: '', type: '', address: '', note: '' })
  }

  if (isLoading) return <div className="text-slate-500">불러오는 중...</div>
  if (isError) return <div className="text-red-500 p-4">데이터를 불러오지 못했습니다.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">일정</h1>
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>일정 등록</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>일정 등록</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>지원 건 *</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, applicationId: v }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="지원 건 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.company.name} — {a.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="scheduledAt">일시 *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>유형 *</Label>
                <Select onValueChange={v => setForm(f => ({ ...f, type: v as ScheduleType }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABELS) as ScheduleType[]).map(t => (
                      <SelectItem key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address">장소 *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" disabled={isPending || !form.applicationId || !form.type} className="w-full">
                {isPending ? '등록 중...' : '등록'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-slate-400 text-sm">등록된 일정이 없습니다.</p>
        ) : (
          sorted.map(s => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">{s.title}</p>
                  <p className="text-sm text-slate-500">
                    <span>{s.application.company.name}</span>
                    <span className="mx-1">—</span>
                    <span>{s.application.position}</span>
                  </p>
                  <p className="text-sm font-medium text-slate-600">
                    {new Date(s.scheduledAt).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {s.address && <p className="text-sm text-slate-500">{s.address}</p>}
                </div>
                <Badge
                  variant="outline"
                  className={TYPE_BADGE_VARIANTS[s.type]}
                >
                  {TYPE_LABELS[s.type]}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
