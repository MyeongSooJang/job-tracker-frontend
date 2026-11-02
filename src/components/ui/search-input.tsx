import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label: string
}

export function SearchInput({ value, onChange, placeholder, label }: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
      />
      <Input
        type="search"
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl border-line bg-white pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 transition-colors hover:bg-surface hover:text-ink-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
