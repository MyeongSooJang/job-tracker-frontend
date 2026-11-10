import { StrictMode } from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MarkdownEditor from '../MarkdownEditor'

const h = vi.hoisted(() => ({
  calls: [] as string[],
  configs: [] as Array<Record<string, unknown>>,
  listener: undefined as undefined | ((ctx: unknown, markdown: string, prev: string) => void),
}))

vi.mock('@milkdown/crepe', () => {
  class Crepe {
    static Feature = { ImageBlock: 'image-block', Latex: 'latex', Placeholder: 'placeholder', Toolbar: 'toolbar', BlockEdit: 'block-edit', LinkTooltip: 'link-tooltip' }
    editor = { config() { return this }, use() { return this } }
    constructor(config: Record<string, unknown>) {
      h.configs.push(config)
    }
    on(fn: (api: { markdownUpdated: (cb: (ctx: unknown, markdown: string, prev: string) => void) => void }) => void) {
      fn({ markdownUpdated: cb => { h.listener = cb } })
      return this
    }
    async create() {
      h.calls.push('create')
    }
    async destroy() {
      h.calls.push('destroy')
    }
  }
  return { Crepe }
})

describe('MarkdownEditor', () => {
  beforeEach(() => {
    h.calls.length = 0
    h.configs.length = 0
    h.listener = undefined
  })

  it('처음 받은 마크다운으로 에디터를 만든다', async () => {
    render(<MarkdownEditor initialValue="## 시작" onChange={vi.fn()} />)

    await waitFor(() => expect(h.calls).toEqual(['create']))
    expect(h.configs[0].defaultValue).toBe('## 시작')
  })

  it('이미지 블록과 수식 기능은 끄고 안내 문구를 넘긴다', async () => {
    render(<MarkdownEditor initialValue="" placeholder="여기에 쓰세요" onChange={vi.fn()} />)

    await waitFor(() => expect(h.calls).toEqual(['create']))
    expect(h.configs[0].features).toEqual({ 'image-block': false, latex: false })
    expect(h.configs[0].featureConfigs).toMatchObject({ placeholder: { text: '여기에 쓰세요' } })
  })

  it('내용이 바뀌면 마크다운을 부모에게 알린다', async () => {
    const onChange = vi.fn()
    render(<MarkdownEditor initialValue="" onChange={onChange} />)
    await waitFor(() => expect(h.calls).toEqual(['create']))

    act(() => h.listener?.({}, '## 새 내용', ''))

    expect(onChange).toHaveBeenCalledWith('## 새 내용')
  })

  it('이전과 같은 마크다운이면 알리지 않는다', async () => {
    const onChange = vi.fn()
    render(<MarkdownEditor initialValue="" onChange={onChange} />)
    await waitFor(() => expect(h.calls).toEqual(['create']))

    act(() => h.listener?.({}, '같은 내용', '같은 내용'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('부모가 새 onChange를 넘겨도 에디터를 다시 만들지 않고 최신 함수를 쓴다', async () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<MarkdownEditor initialValue="" onChange={first} />)
    await waitFor(() => expect(h.calls).toEqual(['create']))

    rerender(<MarkdownEditor initialValue="" onChange={second} />)
    act(() => h.listener?.({}, '바뀜', ''))

    expect(h.calls).toEqual(['create'])
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('바뀜')
  })

  it('화면에서 사라지면 에디터를 정리한다', async () => {
    const { unmount } = render(<MarkdownEditor initialValue="" onChange={vi.fn()} />)
    await waitFor(() => expect(h.calls).toEqual(['create']))

    unmount()

    await waitFor(() => expect(h.calls).toEqual(['create', 'destroy']))
  })

  it('개발 모드에서 효과가 두 번 실행돼도 정리가 끝난 뒤에 다시 만든다', async () => {
    render(
      <StrictMode>
        <MarkdownEditor initialValue="" onChange={vi.fn()} />
      </StrictMode>,
    )

    await waitFor(() => expect(h.calls).toEqual(['create', 'destroy', 'create']))
  })
})

describe('MarkdownEditor 색 도구', () => {
  it('선택 툴바에 색 설정을 넘긴다', async () => {
    h.configs.length = 0
    render(<MarkdownEditor initialValue="" onChange={vi.fn()} />)
    await waitFor(() => expect(h.configs.length).toBeGreaterThan(0))

    const toolbar = (h.configs[0].featureConfigs as Record<string, { buildToolbar?: unknown }>).toolbar
    expect(typeof toolbar.buildToolbar).toBe('function')
  })
})

describe('MarkdownEditor 한글 문구', () => {
  it('블록 메뉴와 툴바의 영어 문구를 한글로 바꿔 넘긴다', async () => {
    h.configs.length = 0
    render(<MarkdownEditor initialValue="" onChange={vi.fn()} />)
    await waitFor(() => expect(h.configs.length).toBeGreaterThan(0))

    const configs = h.configs[0].featureConfigs as Record<string, Record<string, unknown>>
    expect(configs['block-edit'].textGroup).toMatchObject({ label: '텍스트', h1: { label: '제목 1' }, quote: { label: '인용' } })
    expect(configs['block-edit'].listGroup).toMatchObject({ bulletList: { label: '글머리 기호 목록' } })
    expect(configs['block-edit'].advancedGroup).toMatchObject({ table: { label: '표' } })
    expect(configs.toolbar).toMatchObject({ boldLabel: '굵게', linkLabel: '링크' })
  })
})
