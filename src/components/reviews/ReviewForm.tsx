import { useState } from 'react'
import { useWriteReview } from '@/hooks/useReviews'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ChoiceGroup from '@/components/reviews/ChoiceGroup'
import RatingInput from '@/components/reviews/RatingInput'
import {
  ATMOSPHERE_LABELS,
  DIFFICULTIES,
  ROUTE_LABELS,
  difficultyLabel,
  joinQuestions,
  parseQuestions,
} from '@/lib/review'
import type { ApplyRoute, InterviewAtmosphere, Review } from '@/api/types'

const DIFFICULTY_OPTIONS = DIFFICULTIES.map(n => ({ value: n, label: difficultyLabel(n) }))

const ATMOSPHERE_OPTIONS = (Object.keys(ATMOSPHERE_LABELS) as InterviewAtmosphere[]).map(value => ({
  value,
  label: ATMOSPHERE_LABELS[value],
}))

const ROUTE_OPTIONS = (Object.keys(ROUTE_LABELS) as ApplyRoute[]).map(value => ({
  value,
  label: ROUTE_LABELS[value],
}))

interface ReviewFormProps {
  review: Review
  // 같은 화면에 여러 건이 있을 때 접근성 이름을 구분하는 말머리 (예: 회사명).
  subject: string
  contentLabel: string
  contentPlaceholder: string
  saveLabel: string
}

// 면접 기록 작성 폼. 서버가 만든 Review를 수정하며, 저장하면 회사 상세에 익명으로 공개된다.
export default function ReviewForm({
  review,
  subject,
  contentLabel,
  contentPlaceholder,
  saveLabel,
}: ReviewFormProps) {
  const { mutate: writeReview, isPending } = useWriteReview()
  const [content, setContent] = useState(review.content ?? '')
  const [rating, setRating] = useState(review.rating ?? 0)
  const [difficulty, setDifficulty] = useState<number | null>(review.difficulty ?? null)
  const [atmosphere, setAtmosphere] = useState<InterviewAtmosphere | null>(review.atmosphere ?? null)
  const [route, setRoute] = useState<ApplyRoute | null>(review.route ?? null)
  const [questionsText, setQuestionsText] = useState(joinQuestions(review.questions))

  const questions = parseQuestions(questionsText)
  const unchanged =
    content === (review.content ?? '') &&
    rating === (review.rating ?? 0) &&
    difficulty === (review.difficulty ?? null) &&
    atmosphere === (review.atmosphere ?? null) &&
    route === (review.route ?? null) &&
    questions.join('\n') === joinQuestions(review.questions)

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-ink-600">면접 경험 만족도</span>
        <RatingInput value={rating} onChange={setRating} label={`${subject} 면접 경험 만족도`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChoiceGroup label="난이도" options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />
        <ChoiceGroup label="분위기" options={ATMOSPHERE_OPTIONS} value={atmosphere} onChange={setAtmosphere} />
        <ChoiceGroup label="지원 경로" options={ROUTE_OPTIONS} value={route} onChange={setRoute} />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-600" htmlFor={`questions-${review.id}`}>
          받은 질문 <span className="font-normal text-ink-400">(한 줄에 하나씩)</span>
        </label>
        <Textarea
          id={`questions-${review.id}`}
          autoResize
          rows={3}
          placeholder={'자기소개를 해보세요\n프로젝트에서 가장 어려웠던 점은?'}
          aria-label={`${subject} 받은 질문`}
          value={questionsText}
          onChange={e => setQuestionsText(e.target.value)}
        />
      </div>

      <Textarea
        autoResize
        rows={4}
        placeholder={contentPlaceholder}
        aria-label={contentLabel}
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-400">저장하면 회사 상세의 면접 후기에 익명으로 공개돼요.</p>
        <Button
          size="sm"
          disabled={isPending || unchanged || !content.trim() || rating === 0}
          onClick={() =>
            writeReview({
              id: review.id,
              data: { content, rating, difficulty, atmosphere, route, questions },
            })
          }
        >
          {isPending ? '저장 중...' : saveLabel}
        </Button>
      </div>
    </div>
  )
}
