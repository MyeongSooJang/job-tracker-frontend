import { useState } from 'react'
import { Star } from 'lucide-react'
import { useReviews, useWriteReview } from '@/hooks/useReviews'
import type { Review } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const RATINGS = [1, 2, 3, 4, 5]

function RatingStars({ rating }: { rating: number | null }) {
  return (
    <div className="flex gap-0.5" aria-label={rating ? `평점 ${rating}점` : '평점 없음'}>
      {RATINGS.map(n => (
        <Star
          key={n}
          size={14}
          className={cn(rating && n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
        />
      ))}
    </div>
  )
}

export default function Reviews() {
  const { data: reviews = [], isLoading, isError } = useReviews()
  const { mutate: writeReview, isPending, isError: isWriteError } = useWriteReview()
  const [target, setTarget] = useState<Review | null>(null)
  const [form, setForm] = useState({ content: '', rating: 0 })

  const openDialog = (review: Review) => {
    setTarget(review)
    setForm({ content: review.content ?? '', rating: review.rating ?? 0 })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!target || form.rating === 0) return
    writeReview(
      { id: target.id, data: form },
      { onSuccess: () => setTarget(null) },
    )
  }

  if (isLoading) return <div className="text-slate-500">불러오는 중...</div>
  if (isError) return <div className="text-red-500 p-4">데이터를 불러오지 못했습니다.</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">후기</h1>

      {reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          면접 일정을 등록하면 후기를 작성할 수 있습니다.
        </p>
      ) : (
        <div className="grid gap-4">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{review.application.company.name}</CardTitle>
                  <p className="text-sm text-slate-500">{review.application.position}</p>
                </div>
                <div className="flex items-center gap-3">
                  <RatingStars rating={review.rating} />
                  <Button variant="outline" size="sm" onClick={() => openDialog(review)}>
                    {review.content ? '수정' : '작성'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {review.content || '아직 작성된 후기가 없습니다.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={target !== null} onOpenChange={isOpen => !isOpen && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.application.company.name} 후기</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>평점 *</Label>
              <div className="flex gap-1 mt-1">
                {RATINGS.map(n => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n}점`}
                    onClick={() => setForm(f => ({ ...f, rating: n }))}
                  >
                    <Star
                      size={24}
                      className={cn(n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="content">후기 *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={6}
                required
              />
            </div>
            {isWriteError && (
              <p className="text-sm text-red-500">후기를 저장하지 못했습니다.</p>
            )}
            <Button type="submit" disabled={isPending || form.rating === 0} className="w-full">
              {isPending ? '저장 중...' : '저장'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
