import { useState } from 'react'
import { isAxiosError } from 'axios'
import { useCompanies, useCreateCompany } from '@/hooks/useCompanies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export default function Companies() {
  const { data: companies = [], isLoading, isError } = useCompanies()
  const { mutate: createCompany, isPending, error, reset } = useCreateCompany()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', industry: '', website: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCompany(form, {
      onSuccess: () => {
        setOpen(false)
        setForm({ name: '', industry: '', website: '' })
      },
    })
  }

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setForm({ name: '', industry: '', website: '' })
      reset()
    }
  }

  if (isLoading) return <div className="text-slate-500">불러오는 중...</div>
  if (isError) return <div className="text-red-500 p-4">데이터를 불러오지 못했습니다.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">회사 목록</h1>
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>회사 등록</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>회사 등록</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">회사명 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">업종</Label>
                <Input
                  id="industry"
                  value={form.industry}
                  onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="website">홈페이지</Label>
                <Input
                  id="website"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">
                  {isAxiosError(error) && error.response?.status === 409
                    ? '이미 등록된 회사입니다.'
                    : '회사를 등록하지 못했습니다.'}
                </p>
              )}
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? '등록 중...' : '등록'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">총 {companies.length}개 회사</CardTitle>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">등록된 회사가 없습니다.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회사명</TableHead>
                  <TableHead>업종</TableHead>
                  <TableHead>홈페이지</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.industry || '-'}</TableCell>
                    <TableCell>
                      {c.website
                        ? (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {c.website}
                          </a>
                          )
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
