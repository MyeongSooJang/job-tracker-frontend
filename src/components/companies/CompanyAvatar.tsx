import { cn } from '@/lib/utils'

interface CompanyAvatarProps {
  name: string
  className?: string
}

// 로고가 없으므로 회사명 첫 글자를 이니셜로 보여준다.
export default function CompanyAvatar({ name, className }: CompanyAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg font-bold text-brand-700',
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  )
}
