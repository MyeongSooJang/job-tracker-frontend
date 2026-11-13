import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteFile, uploadFile } from '@/api/profile'
import { useDeleteFile, useUploadFile } from '../useProfile'

vi.mock('@/api/profile', () => ({
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}))

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { invalidate, wrapper }
}

describe('파일 훅', () => {
  beforeEach(() => vi.clearAllMocks())

  it('업로드에 성공하면 파일 목록이 든 프로필을 다시 불러온다', async () => {
    vi.mocked(uploadFile).mockResolvedValue({ id: 1, type: 'RESUME', fileName: 'a.pdf', sizeBytes: 1, createdAt: '' })
    const { invalidate, wrapper } = setup()
    const { result } = renderHook(() => useUploadFile(), { wrapper })
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })

    await act(() => result.current.mutateAsync({ file, type: 'RESUME' }))

    expect(uploadFile).toHaveBeenCalledWith(file, 'RESUME')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['profile'] })
  })

  it('삭제에 성공하면 프로필을 다시 불러온다', async () => {
    vi.mocked(deleteFile).mockResolvedValue(undefined)
    const { invalidate, wrapper } = setup()
    const { result } = renderHook(() => useDeleteFile(), { wrapper })

    await act(() => result.current.mutateAsync(7))

    expect(deleteFile).toHaveBeenCalledWith(7)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['profile'] })
  })

  it('이미 삭제된 파일(FILE_NOT_FOUND)이면 목록을 다시 불러온다', async () => {
    const error = new AxiosError('x', '404', undefined, undefined, {
      status: 404, data: { code: 'FILE_NOT_FOUND', message: '파일을 찾을 수 없습니다.' }, statusText: '', headers: {}, config: {} as never,
    })
    vi.mocked(deleteFile).mockRejectedValue(error)
    const { invalidate, wrapper } = setup()
    const { result } = renderHook(() => useDeleteFile(), { wrapper })

    act(() => result.current.mutate(7))

    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['profile'] }))
  })

  it('다른 삭제 실패는 목록을 다시 불러오지 않는다', async () => {
    vi.mocked(deleteFile).mockRejectedValue(new Error('network'))
    const { invalidate, wrapper } = setup()
    const { result } = renderHook(() => useDeleteFile(), { wrapper })

    act(() => result.current.mutate(7))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(invalidate).not.toHaveBeenCalled()
  })
})
