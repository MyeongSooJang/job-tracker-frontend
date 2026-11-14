import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApplications, useCreateApplication, useUpdateApplicationStatus } from '@/hooks/useApplications'
import { useCompanies } from '@/hooks/useCompanies'
import PassScheduleDialog from '@/components/schedules/PassScheduleDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ACTION_LABELS, NEXT_STATUSES, STATUS_LABELS } from '@/lib/status'
import {
  JOB_SITES,
  JOB_SITE_FILTER_OPTIONS,
  JOB_SITE_LABELS,
  jobSiteLabel,
  matchesJobSite,
  type JobSiteFilter,
} from '@/lib/jobSite'
import { resumeViewLabel } from '@/lib/application'
import { SearchInput } from '@/components/ui/search-input'
import { Pagination } from '@/components/ui/pagination'
import { clampPage, paginate, totalPages } from '@/lib/pagination'
import type { ApplicationStatus, JobSite } from '@/api/types'

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  RESUME_SUBMITTED: 'bg-slate-100 text-slate-700',
  INTERVIEW: 'bg-brand-100 text-brand-700',
  ACCEPTED: 'bg-success-soft text-success-strong',
  REJECTED: 'bg-red-100 text-red-700',
}

function StatusCell({
  id,
  status,
  isAutoRejected,
  onPassed,
}: {
  id: number
  status: ApplicationStatus
  isAutoRejected: boolean
  onPassed: () => void
}) {
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus(id)
  const nextStatuses = NEXT_STATUSES[status]

  return (
    <div className="flex flex-col items-center gap-2 whitespace-nowrap">
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
      {isAutoRejected && (
        <span
          title="공고 마감일 + 1달이 지나 자동으로 불합격 처리되었습니다"
          className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500"
        >
          자동
        </span>
      )}
      {nextStatuses.length > 0 && (
        <div className="flex items-center gap-2">
          {nextStatuses.map((s) => (
            <Button
              key={s}
              variant={s === 'REJECTED' ? 'destructive' : 'outline'}
              size="sm"
              disabled={isPending}
              onClick={() => (s === 'INTERVIEW' ? onPassed() : updateStatus(s))}
            >
              {ACTION_LABELS[s]}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

const FILTER_OPTIONS: Array<ApplicationStatus | 'ALL'> = [
  'ALL',
  'RESUME_SUBMITTED',
  'INTERVIEW',
  'ACCEPTED',
  'REJECTED',
]

const PAGE_SIZE = 10

const EMPTY_FORM = { companyId: '', position: '', appliedDate: '', jobSite: '' as JobSite | '', deadline: '' }

export default function Applications() {
  const { data: applications = [], isLoading, isError } = useApplications()
  const { data: companies = [] } = useCompanies()
  const { mutate: createApplication, isPending } = useCreateApplication()

  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [siteFilter, setSiteFilter] = useState<JobSiteFilter>('ALL')
  const [passed, setPassed] = useState<{ id: number; companyName: string } | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const keyword = query.trim().toLowerCase()
  // 지원일이 최근인 건이 위로 오도록 정렬한다. 지원일이 같으면 나중에 등록한 건이 먼저 온다.
  // 지원일은 yyyy-MM-dd 형식이라 문자열 비교로 날짜 순서가 맞다.
  const filtered = applications
    .filter(
      (a) =>
        (filter === 'ALL' || a.status === filter) &&
        matchesJobSite(a.jobSite, siteFilter) &&
        (!keyword || a.company.name.toLowerCase().includes(keyword)),
    )
    .sort((a, b) => b.appliedDate.localeCompare(a.appliedDate) || b.id - a.id)
  const pageCount = totalPages(filtered.length, PAGE_SIZE)
  const currentPage = clampPage(page, pageCount)
  const visible = paginate(filtered, currentPage, PAGE_SIZE)

  // 필터·검색어가 바뀌면 결과의 처음부터 보여준다.
  const resetPage = () => setPage(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyId || !form.jobSite) return
    createApplication(
      {
        companyId: Number(form.companyId),
        position: form.position,
        appliedDate: form.appliedDate,
        jobSite: form.jobSite,
        ...(form.deadline ? { deadline: form.deadline } : {}),
      },
      {
        onSuccess: () => {
          setOpen(false)
          setForm(EMPTY_FORM)
        },
      },
    )
  }

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) setForm(EMPTY_FORM)
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
              <div>
                <Label>지원 사이트 *</Label>
                <Select
                  value={form.jobSite}
                  onValueChange={(v) => setForm((f) => ({ ...f, jobSite: v as JobSite }))}
                >
                  <SelectTrigger aria-label="지원 사이트">
                    <SelectValue placeholder="지원한 사이트 선택" />
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
              <div>
                <Label htmlFor="deadline">공고 마감일</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                />
              </div>
              <Button
                type="submit"
                disabled={isPending || !form.companyId || !form.jobSite}
                className="w-full"
              >
                {isPending ? '등록 중...' : '등록'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SearchInput
        label="회사 검색"
        placeholder="회사명으로 검색"
        value={query}
        onChange={(v) => {
          setQuery(v)
          resetPage()
        }}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={filter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter(s)
                resetPage()
              }}
            >
              {s === 'ALL' ? '전체' : STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">지원 사이트</span>
          <Select value={siteFilter} onValueChange={(v) => {
              setSiteFilter(v as JobSiteFilter)
              resetPage()
            }}>
            <SelectTrigger aria-label="지원 사이트 필터" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_SITE_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length}건
            {siteFilter !== 'ALL' &&
              ` · ${JOB_SITE_FILTER_OPTIONS.find((o) => o.value === siteFilter)?.label}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[860px] [&_th]:text-center [&_td]:text-center">
            <TableHeader>
              <TableRow>
                <TableHead>회사</TableHead>
                <TableHead>직무</TableHead>
                <TableHead>지원 사이트</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>지원일</TableHead>
                <TableHead>마감일</TableHead>
                <TableHead>열람</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((a) => (
                <TableRow key={a.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell className="whitespace-nowrap">
                    <Link
                      to={`/applications/${a.id}`}
                      className="font-medium hover:underline"
                    >
                      {a.company.name}
                    </Link>
                  </TableCell>
                  <TableCell>{a.position}</TableCell>
                  <TableCell className="whitespace-nowrap">{jobSiteLabel(a.jobSite)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusCell
                      id={a.id}
                      status={a.status}
                      isAutoRejected={!!a.autoRejectedAt}
                      onPassed={() => setPassed({ id: a.id, companyName: a.company.name })}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{a.appliedDate}</TableCell>
                  <TableCell className="whitespace-nowrap">{a.deadline ?? '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{resumeViewLabel(a.resumeView)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Pagination page={currentPage} totalPages={pageCount} onChange={setPage} />
          </div>
        </CardContent>
      </Card>

      {passed && (
        <PassScheduleDialog
          applicationId={passed.id}
          companyName={passed.companyName}
          onClose={() => setPassed(null)}
        />
      )}
    </div>
  )
}
