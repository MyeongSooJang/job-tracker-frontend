import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createStudyLog, deleteStudyLog, getStudyLogs, updateStudyLog } from '@/api/studyLogs'
import { useCreateStudyLog, useDeleteStudyLog, useStudyLogFeed, useUpdateStudyLog } from '../useStudyLogs'

vi.mock('@/api/studyLogs', () => ({
  getStudyLog: vi.fn(),
  getStudyLogs: vi.fn(),
  getHeatmap: vi.fn(),
  getStudyStats: vi.fn(),
  createStudyLog: vi.fn(),
  updateStudyLog: vi.fn(),
  deleteStudyLog: vi.fn(),
}))

const created = { id: 7, studyDate: '2026-11-03', title: 'JPA', content: '내용', studyMinutes: 90 }

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('useStudyLogs 훅', () => {
  beforeEach(() => vi.clearAllMocks())

  it('글을 만들면 상세 캐시에 바로 채워 두어 이어서 열어도 다시 불러오지 않는다', async () => {
    vi.mocked(createStudyLog).mockResolvedValue(created)
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useCreateStudyLog(), { wrapper })

    await act(() => result.current.mutateAsync({ studyDate: '2026-11-03', title: 'JPA', content: '내용', studyMinutes: 90 }))

    expect(queryClient.getQueryData(['study-logs', 'detail', 7])).toEqual(created)
  })

  it('글을 수정하면 상세 캐시를 수정된 글로 바꾼다', async () => {
    const updated = { ...created, title: '수정됨' }
    vi.mocked(updateStudyLog).mockResolvedValue(updated)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(['study-logs', 'detail', 7], created)
    const { result } = renderHook(() => useUpdateStudyLog(), { wrapper })

    await act(() => result.current.mutateAsync({ id: 7, data: { title: '수정됨', content: '내용', studyMinutes: 90 } }))

    expect(queryClient.getQueryData(['study-logs', 'detail', 7])).toEqual(updated)
  })

  it('글을 삭제하면 상세 캐시를 지운다', async () => {
    vi.mocked(deleteStudyLog).mockResolvedValue(undefined)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(['study-logs', 'detail', 7], created)
    const { result } = renderHook(() => useDeleteStudyLog(), { wrapper })

    await act(() => result.current.mutateAsync(7))

    expect(queryClient.getQueryData(['study-logs', 'detail', 7])).toBeUndefined()
  })

  it('목록은 오늘부터 30일 창을 먼저 불러오고 더 보기로 직전 30일을 이어서 불러온다', async () => {
    vi.mocked(getStudyLogs).mockResolvedValue([])
    const { wrapper } = setup()
    const { result } = renderHook(() => useStudyLogFeed('2026-11-04'), { wrapper })

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(1))
    expect(getStudyLogs).toHaveBeenNthCalledWith(1, '2026-10-06', '2026-11-04')

    await act(() => result.current.fetchNextPage())

    expect(getStudyLogs).toHaveBeenNthCalledWith(2, '2026-09-06', '2026-10-05')
  })
})
