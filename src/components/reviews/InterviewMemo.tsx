import { useState } from 'react'
import { useReviews, useWriteReview } from '@/hooks/useReviews'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import RatingInput from '@/components/reviews/RatingInput'
import type { Review } from '@/api/types'

function MemoEditor({ review }: { review: Review }) {
  const { mutate: writeReview, isPending } = useWriteReview()
  const [content, setContent] = useState(review.content ?? '')
  const [rating, setRating] = useState(review.rating ?? 0)
  const unchanged = content === (review.content ?? '') && rating === (review.rating ?? 0)

  return (
    <CardContent className="space-y-3">
      <RatingInput value={rating} onChange={setRating} label="면접 평점" />
      <Textarea
        rows={5}
        placeholder="면접 분위기, 받은 질문, 아쉬운 점 등을 메모해 보세요."
        aria-label="면접 메모"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={isPending || unchanged || !content.trim() || rating === 0}
          onClick={() => writeReview({ id: review.id, data: { content, rating } })}
        >
          {isPending ? '저장 중...' : '메모 저장'}
        </Button>
      </div>
    </CardContent>
  )
}

// 지원 상세의 면접 메모. 면접 일정을 등록하면 서버가 만든 후기(Review)를 메모로 수정한다.
export default function InterviewMemo({ applicationId }: { applicationId: number }) {
  const { data: reviews = [] } = useReviews()
  const review = reviews.find((r) => r.application.id === applicationId)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">면접 메모</CardTitle>
      </CardHeader>
      {review ? (
        <MemoEditor key={review.id} review={review} />
      ) : (
        <CardContent>
          <p className="text-sm text-slate-400">서류합격 후 면접 일정을 등록하면 메모를 남길 수 있습니다.</p>
        </CardContent>
      )}
    </Card>
  )
}
