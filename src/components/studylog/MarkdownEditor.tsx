import { useEffect, useRef } from 'react'
import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'
import './markdown-editor.css'

interface MarkdownEditorProps {
  initialValue: string
  onChange: (markdown: string) => void
  placeholder?: string
  ariaLabel?: string
}

// Crepe(노션 스타일 블록 에디터)를 감싼다. 시작 값은 마운트 때만 쓰고, 내용이 바뀌면 마크다운 문자열을 알린다.
// 값을 바꿔 다시 시작하려면 부모가 key를 바꿔 새로 마운트한다.
export default function MarkdownEditor({ initialValue, onChange, placeholder, ariaLabel }: MarkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  // 개발 모드(StrictMode)는 효과를 두 번 실행하므로 만들기·정리를 한 줄로 이어서 같은 root에 에디터가 겹치지 않게 한다.
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const crepe = new Crepe({
      root,
      defaultValue: initialValue,
      features: { [Crepe.Feature.ImageBlock]: false, [Crepe.Feature.Latex]: false },
      featureConfigs: { [Crepe.Feature.Placeholder]: { text: placeholder } },
    })
    crepe.on(listener => {
      listener.markdownUpdated((_ctx, markdown, previous) => {
        if (markdown !== previous) onChangeRef.current(markdown)
      })
    })
    const created = queueRef.current.then(() => crepe.create()).catch(() => undefined)
    queueRef.current = created
    return () => {
      queueRef.current = created.then(() => crepe.destroy()).catch(() => undefined)
    }
    // 시작 값은 마운트 때만 쓴다.
  }, [])

  return <div ref={rootRef} role="group" aria-label={ariaLabel} className="study-editor" />
}
