import { useReviews } from '@/hooks/useReviews'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReviewForm from '@/components/reviews/ReviewForm'

// 지원 상세의 면접 메모. 면접 일정을 등록하면 서버가 만든 후기(Review)를 메모로 수정한다.
export default function InterviewMemo({ applicationId }: { applicationId: number }) {
  const { data: reviews = [] } = useReviews()
  const review = reviews.find((r) => r.application.id === applicationId)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">면접 메모</CardTitle>
      </CardHeader>
      <CardContent>
        {review ? (
          <ReviewForm
            key={review.id}
            review={review}
            subject="면접"
            contentLabel="면접 메모"
            contentPlaceholder="면접 분위기, 아쉬운 점 등을 메모해 보세요."
            saveLabel="메모 저장"
          />
        ) : (
          <p className="text-sm text-slate-400">서류합격 후 면접 일정을 등록하면 메모를 남길 수 있습니다.</p>
        )}
      </CardContent>
    </Card>
  )
}
