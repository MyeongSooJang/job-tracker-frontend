import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApplications, useCreateApplication, useUpdateApplicationStatus } from '@/hooks/useApplications'
import { useCompanies } from '@/hooks/useCompanies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  RESUME_SUBMITTED: 'bg-slate-100 text-slate-700',
  RESUME_PASSED: 'bg-blue-100 text-blue-700',
  INTERVIEW_1: 'bg-yellow-100 text-yellow-700',
  INTERVIEW_2: 'bg-orange-100 text-orange-700',
  FINAL: 'bg-purple-100 text-purple-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  RESUME_SUBMITTED: ['RESUME_PASSED', 'REJECTED'],
  RESUME_PASSED: ['INTERVIEW_1', 'REJECTED'],
  INTERVIEW_1: ['INTERVIEW_2', 'FINAL', 'REJECTED'],
  INTERVIEW_2: ['FINAL', 'REJECTED'],
  FINAL: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
}

function StatusCell({ id, status }: { id: number; status: ApplicationStatus }) {
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus(id)
  const nextStatuses = NEXT_STATUSES[status]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
      {nextStatuses.map((s) => (
        <Button
          key={s}
          variant={s === 'REJECTED' ? 'destructive' : 'outline'}
          size="sm"
          disabled={isPending}
          onClick={() => updateStatus(s)}
        >
          → {STATUS_LABELS[s]}
        </Button>
      ))}
    </div>
  )
}

const FILTER_OPTIONS: Array<ApplicationStatus | 'ALL'> = [
  'ALL',
  'RESUME_SUBMITTED',
  'RESUME_PASSED',
  'INTERVIEW_1',
  'INTERVIEW_2',
  'FINAL',
  'ACCEPTED',
  'REJECTED',
]

export default function Applications() {
  const { data: applications = [], isLoading, isError } = useApplications()
  const { data: companies = [] } = useCompanies()
  const { mutate: createApplication, isPending } = useCreateApplication()

  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [form, setForm] = useState({ companyId: '', position: '', appliedDate: '' })

  const filtered =
    filter === 'ALL' ? applications : applications.filter((a) => a.status === filter)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyId) return
    createApplication(
      { companyId: Number(form.companyId), position: form.position, appliedDate: form.appliedDate },
      {
        onSuccess: () => {
          setOpen(false)
          setForm({ companyId: '', position: '', appliedDate: '' })
        },
      },
    )
  }

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) setForm({ companyId: '', position: '', appliedDate: '' })
  }

  if (isLoading) return <div className="text-slate-500">불러오는 중...</div>
  if (isError) return <div className="text-red-500 p-4">데이터를 불러오지 못했습니다.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">지원 현황</h1>
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>지원 등록</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>지원 등록</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>회사 *</Label>
                <Select
                  value={form.companyId}
                  onValueChange={(v) => setForm((f) => ({ ...f, companyId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="회사 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">직무 *</Label>
                <Input
                  id="position"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="appliedDate">지원일 *</Label>
                <Input
                  id="appliedDate"
                  type="date"
                  value={form.appliedDate}
                  onChange={(e) => setForm((f) => ({ ...f, appliedDate: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" disabled={isPending || !form.companyId} className="w-full">
                {isPending ? '등록 중...' : '등록'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((s) => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? '전체' : STATUS_LABELS[s]}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{filtered.length}건</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회사</TableHead>
                <TableHead>직무</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>지원일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>
                    <Link
                      to={`/applications/${a.id}`}
                      className="font-medium hover:underline"
                    >
                      {a.company.name}
                    </Link>
                  </TableCell>
                  <TableCell>{a.position}</TableCell>
                  <TableCell>
                    <StatusCell id={a.id} status={a.status} />
                  </TableCell>
                  <TableCell>{a.appliedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
