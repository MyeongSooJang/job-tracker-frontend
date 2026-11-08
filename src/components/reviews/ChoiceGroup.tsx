import { cn } from '@/lib/utils'

interface ChoiceGroupProps<T extends string | number> {
  label: string
  options: { value: T; label: string }[]
  value: T | null | undefined
  onChange: (value: T | null) => void
}

// 선택값을 한 줄로 보여주는 버튼 그룹. 선택은 선택사항이라 고른 값을 다시 누르면 해제된다.
export default function ChoiceGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-ink-600" aria-hidden="true">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map(option => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : option.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                selected
                  ? 'border-brand-500 bg-brand-50 text-brand-600'
                  : 'border-line bg-white text-ink-600 hover:border-brand-100 hover:bg-surface',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
