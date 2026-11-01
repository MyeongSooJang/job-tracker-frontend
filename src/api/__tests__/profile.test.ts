import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import { deleteResume, downloadResume, getMyProfile, updateMyProfile, uploadResume } from '@/api/profile'

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('profile API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getMyProfile: GET /api/me/profile을 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { name: '홍길동' } })

    const result = await getMyProfile()

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/profile')
    expect(result.name).toBe('홍길동')
  })

  it('updateMyProfile: PUT /api/me/profile을 호출한다', async () => {
    const req = {
      name: '홍길동', phone: null, birthDate: null, address: null, githubUrl: null, blogUrl: null,
      portfolioUrl: null, education: null, career: null, desiredJob: '백엔드', introduction: null,
    }
    vi.mocked(apiClient.put).mockResolvedValue({ data: { ...req, email: 'a@b.c', resume: null } })

    await updateMyProfile(req)

    expect(apiClient.put).toHaveBeenCalledWith('/api/me/profile', req)
  })

  it('uploadResume: file 파트를 담은 FormData를 multipart로 PUT한다', async () => {
    const file = new File(['%PDF-1.7'], '이력서.pdf', { type: 'application/pdf' })
    vi.mocked(apiClient.put).mockResolvedValue({ data: { fileName: '이력서.pdf', sizeBytes: 8, updatedAt: '' } })

    await uploadResume(file)

    const [url, body, config] = vi.mocked(apiClient.put).mock.calls[0]
    expect(url).toBe('/api/me/resume')
    expect(body).toBeInstanceOf(FormData)
    expect((body as FormData).get('file')).toBeInstanceOf(File)
    expect(((body as FormData).get('file') as File).name).toBe('이력서.pdf')
    expect(config?.headers).toEqual({ 'Content-Type': 'multipart/form-data' })
  })

  it('downloadResume: blob 응답으로 GET /api/me/resume을 호출한다', async () => {
    const blob = new Blob(['%PDF-1.7'])
    vi.mocked(apiClient.get).mockResolvedValue({ data: blob })

    const result = await downloadResume()

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/resume', { responseType: 'blob' })
    expect(result).toBe(blob)
  })

  it('deleteResume: DELETE /api/me/resume을 호출한다', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 })

    await deleteResume()

    expect(apiClient.delete).toHaveBeenCalledWith('/api/me/resume')
  })
})
