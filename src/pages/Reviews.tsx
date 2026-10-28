import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReviews, useWriteReview } from '@/hooks/useReviews'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { STATUS_LABELS } from '@/lib/status'
import type { Review } from '@/api/types'

function ReviewCard({ review }: { review: Review }) {
  const { mutate: writeReview, isPending } = useWriteReview()
  const [content, setContent] = useState(review.content ?? '')
  const unchanged = content === (review.content ?? '')

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            <Link to={`/applications/${review.application.id}`} className="hover:underline">
              {review.application.company.name}
            </Link>
            <span className="text-slate-400 font-normal ml-2">— {review.application.position}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {STATUS_LABELS[review.application.status]}
            </Badge>
            {!review.content && (
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                작성 전
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={4}
          placeholder="면접 분위기, 받은 질문, 아쉬운 점 등 후기를 남겨 보세요."
          aria-label={`${review.application.company.name} 후기`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={isPending || unchanged || !content.trim()}
            onClick={() => writeReview({ id: review.id, content })}
          >
            {isPending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Reviews() {
  const { data: reviews = [], isLoading, isError } = useReviews()

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  if (isLoading) return <div className="text-slate-500">불러오는 중...</div>
  if (isError) return <div className="text-red-500 p-4">데이터를 불러오지 못했습니다.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">후기</h1>
        <p className="text-sm text-slate-500 mt-1">
          서류합격한 지원 건은 후기가 자동으로 만들어집니다.
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-slate-400 text-sm">
          아직 후기가 없습니다. 지원 건이 서류합격되면 이곳에 나타납니다.
        </p>
      ) : (
        <div className="space-y-4">
          {sorted.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  )
}
