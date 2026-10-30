import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // true면 내용 길이에 맞춰 높이가 늘어나 스크롤 없이 전체가 보인다.
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, value, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null)
    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement)

    React.useLayoutEffect(() => {
      const el = innerRef.current
      if (!autoResize || !el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [autoResize, value])

    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          autoResize && 'resize-none overflow-hidden',
          className,
        )}
        ref={innerRef}
        value={value}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
