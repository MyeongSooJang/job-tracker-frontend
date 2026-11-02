import { calcPreparationMonths, getPreparationGrade, type PreparationGradeTone } from '@/lib/profile'
import { cn } from '@/lib/utils'

// 색 토큰은 tailwind.config.js의 grade 항목에서만 관리한다. (클래스는 정적 문자열이어야 빌드에 포함된다.)
const TONE_CLASS: Record<PreparationGradeTone, string> = {
  rookie: 'bg-grade-rookie-bg text-grade-rookie-fg',
  challenger: 'bg-grade-challenger-bg text-grade-challenger-fg',
  striver: 'bg-grade-striver-bg text-grade-striver-fg',
  diligent: 'bg-grade-diligent-bg text-grade-diligent-fg',
  dreamer: 'bg-grade-dreamer-bg text-grade-dreamer-fg',
}

interface Props {
  startDate: string | null
  // 오늘 날짜. 테스트에서 시간 의존을 없애기 위해 주입할 수 있다.
  today?: Date
  onGoToInput?: () => void
}

export default function PreparationGradeBadge({ startDate, today, onGoToInput }: Props) {
  if (!startDate) {
    return (
      <p className="text-sm text-ink-600">
        준비 시작일을 입력하면 등급이 표시돼요
        {onGoToInput && (
          <button
            type="button"
            onClick={onGoToInput}
            className="ml-2 font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
          >
            입력하러 가기
          </button>
        )}
      </p>
    )
  }

  const months = calcPreparationMonths(startDate, today)
  const grade = getPreparationGrade(months)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold',
        TONE_CLASS[grade.tone],
      )}
    >
      {grade.name}
      <span className="font-normal opacity-80">준비 {months}개월</span>
    </span>
  )
}
