import { useState } from 'react'
import { useCreateSchedule } from '@/hooks/useSchedules'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  applicationId: number
  companyName: string
  onClose: () => void
}

// 서류합격 직후 다음 단계(면접) 일정을 바로 등록하도록 유도하는 다이얼로그.
// 열릴 때마다 새로 마운트해서 사용한다 (폼 초기화 목적).
export default function PassScheduleDialog({ applicationId, companyName, onClose }: Props) {
  const { mutate: createSchedule, isPending } = useCreateSchedule()
  const [form, setForm] = useState({ title: `${companyName} 면접`, scheduledAt: '', address: '', note: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createSchedule(
      {
        applicationId,
        title: form.title,
        scheduledAt: form.scheduledAt + ':00',
        type: 'INTERVIEW',
        address: form.address,
        note: form.note,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>서류합격 — 면접 일정 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pass-title">제목 *</Label>
            <Input
              id="pass-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="pass-scheduledAt">면접 일시 *</Label>
            <Input
              id="pass-scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="pass-address">장소 *</Label>
            <Input
              id="pass-address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="pass-note">메모</Label>
            <Textarea
              id="pass-note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              나중에
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? '등록 중...' : '일정 등록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
