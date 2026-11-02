import { useState } from 'react'
import { isAxiosError } from 'axios'
import { useCompanies, useCreateCompany } from '@/hooks/useCompanies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { SearchInput } from '@/components/ui/search-input'
import { Pagination } from '@/components/ui/pagination'
import CompanyCard from '@/components/companies/CompanyCard'
import { filterCompanies } from '@/lib/companySearch'
import { clampPage, paginate, totalPages } from '@/lib/pagination'

const PAGE_SIZE = 8

export default function Companies() {
  const { data: companies = [], isLoading, isError } = useCompanies()
  const { mutate: createCompany, isPending, error, reset } = useCreateCompany()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', industry: '', website: '' })
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = filterCompanies(companies, query)
  const pageCount = totalPages(filtered.length, PAGE_SIZE)
  const currentPage = clampPage(page, pageCount)
  const visible = paginate(filtered, currentPage, PAGE_SIZE)

  // 검색어가 바뀌면 결과의 처음부터 보여준다.
  const handleQueryChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }

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
        <div>
          <h1 className="text-2xl font-bold text-ink-900">회사</h1>
          <p className="mt-1 text-sm text-ink-600">회사를 선택해 면접 후기를 확인해 보세요.</p>
        </div>
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

      <SearchInput
        label="회사 검색"
        value={query}
        onChange={handleQueryChange}
        placeholder="회사명 또는 업종으로 검색"
      />

      {companies.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-400">등록된 회사가 없습니다.</p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-400">
          &lsquo;{query.trim()}&rsquo;에 대한 검색 결과가 없습니다.
        </p>
      ) : (
        <>
          <p className="text-sm text-ink-600">
            총 <span className="font-semibold text-ink-900">{filtered.length}</span>개 회사
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map(c => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
          <Pagination page={currentPage} totalPages={pageCount} onChange={setPage} />
        </>
      )}
    </div>
  )
}
