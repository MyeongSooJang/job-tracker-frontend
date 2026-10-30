import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const RATINGS = [1, 2, 3, 4, 5]

interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  label: string
}

export default function RatingInput({ value, onChange, label }: RatingInputProps) {
  return (
    <div className="flex gap-1" role="group" aria-label={label}>
      {RATINGS.map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n}점`}
          aria-pressed={n <= value}
          onClick={() => onChange(n)}
        >
          <Star
            size={20}
            className={cn(n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
          />
        </button>
      ))}
    </div>
  )
}
