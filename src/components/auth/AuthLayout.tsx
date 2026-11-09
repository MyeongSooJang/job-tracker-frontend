import { Card } from '@/components/ui/card'

interface AuthLayoutProps {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}

export default function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-10 font-sans">
      <div className="flex items-center gap-2.5 mb-8">
        <img src="/brand/mark-light.svg" alt="" className="w-8 h-8" />
        <span className="text-lg font-bold text-ink-900 tracking-tight">쌍떡잎</span>
      </div>
      <Card className="w-full max-w-sm rounded-xl border-line p-6 sm:p-8 shadow-[0_1px_2px_rgba(16,24,40,0.05)] animate-fade-up motion-reduce:animate-none">
        <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
        <p className="mt-1.5 mb-6 text-sm text-ink-600">{description}</p>
        {children}
      </Card>
      <div className="mt-6 text-sm text-ink-600">{footer}</div>
    </div>
  )
}
