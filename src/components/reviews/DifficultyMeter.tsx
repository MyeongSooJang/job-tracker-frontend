import { cn } from '@/lib/utils'
import { DIFFICULTIES, difficultyLabel } from '@/lib/review'

interface DifficultyMeterProps {
  value: number
}

// 읽기 전용 난이도 표시. 채워진 칸 수가 난이도다.
export default function DifficultyMeter({ value }: DifficultyMeterProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={`난이도 ${value}/5 ${difficultyLabel(value)}`}
    >
      <span className="text-xs text-ink-400" aria-hidden="true">난이도</span>
      <div className="flex gap-0.5" aria-hidden="true">
        {DIFFICULTIES.map(n => (
          <span
            key={n}
            className={cn('h-2 w-4 rounded-sm', n <= value ? 'bg-brand-500' : 'bg-line')}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-ink-600" aria-hidden="true">
        {difficultyLabel(value)}
      </span>
    </div>
  )
}
