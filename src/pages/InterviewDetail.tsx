import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useInterviews, useAddQuestion } from '@/hooks/useInterviews'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function InterviewDetail() {
  const { applicationId, interviewId } = useParams<{ applicationId: string; interviewId: string }>()
  const appId = Number(applicationId)
  const intId = Number(interviewId)

  const { data: interviews = [], isLoading, isError } = useInterviews(appId)
  const interview = interviews.find(i => i.id === intId)
  const { mutate: addQuestion, isPending } = useAddQuestion(appId, intId)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ question: '', answer: '', memo: '' })

  if (isLoading) return <div className="text-slate-500">불러오는 중...</div>
  if (isError) return <div className="text-red-500 p-4">데이터를 불러오지 못했습니다.</div>
  if (!interview) return <div className="text-slate-500">면접을 찾을 수 없습니다.</div>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addQuestion(form, {
      onSuccess: () => { setOpen(false); setForm({ question: '', answer: '', memo: '' }) },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to={`/applications/${appId}`} className="hover:underline">지원 상세</Link>
        <span>/</span>
        <span>{interview.round}차 면접</span>
      </div>

      <Card>
        <CardHeader><CardTitle>{interview.round}차 면접</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><span className="text-slate-500">일시: </span>{new Date(interview.interviewDate).toLocaleString('ko-KR')}</p>
          {interview.location && <p><span className="text-slate-500">장소: </span>{interview.location}</p>}
          {interview.note && <p><span className="text-slate-500">메모: </span>{interview.note}</p>}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">질문/답변 ({interview.questions?.length ?? 0})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm">질문 추가</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>질문 추가</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">질문 *</Label>
                <Input id="question" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="answer">답변</Label>
                <Textarea id="answer" rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="memo">메모</Label>
                <Input id="memo" value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} />
              </div>
              <Button type="submit" disabled={isPending} className="w-full">{isPending ? '추가 중...' : '추가'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {(interview.questions ?? []).length === 0 ? (
          <p className="text-slate-400 text-sm">등록된 질문이 없습니다.</p>
        ) : (
          (interview.questions ?? []).map((q, idx) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  <span className="text-slate-400 mr-1">Q{idx + 1}.</span>
                  <span>{q.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {q.answer && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1">답변</p>
                    <p className="whitespace-pre-wrap">{q.answer}</p>
                  </div>
                )}
                {q.memo && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800 text-xs">
                    {q.memo}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
