import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const STARS = [1, 2, 3, 4, 5]

interface RatingStarsProps {
  value: number
  size?: number
  className?: string
}

// 읽기 전용 별점. 소수 평점은 반올림해서 채운다.
export default function RatingStars({ value, size = 16, className }: RatingStarsProps) {
  const filled = Math.round(value)
  return (
    <div
      className={cn('flex gap-0.5', className)}
      role="img"
      aria-label={`별점 ${value.toFixed(1)}점`}
    >
      {STARS.map(n => (
        <Star
          key={n}
          size={size}
          className={n <= filled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  )
}
