import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import { deleteResume, downloadResume, getMyProfile, updateMyProfile, uploadResume } from '@/api/profile'

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('profile API', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  it('getMyProfile: GET /api/me/profile을 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { name: '홍길동' } })

    const result = await getMyProfile()

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/profile')
    expect(result.name).toBe('홍길동')
  })

  it('updateMyProfile: PUT /api/me/profile을 호출한다', async () => {
    const req = {
      name: '홍길동', phone: null, birthDate: null, jobSearchStartDate: null, address: null, githubUrl: null, blogUrl: null,
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

  it('downloadResume: 다운로드 주소를 받아 인증 헤더 없이 S3에서 Blob을 받는다', async () => {
    const blob = new Blob(['%PDF-1.7'])
    const url = 'https://bucket.s3.amazonaws.com/resumes/1/a.pdf?X-Amz-Signature=x'
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { url, fileName: '이력서.pdf', expiresAt: '2026-11-05T01:05:00Z' },
    })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) })
    vi.stubGlobal('fetch', fetchMock)

    const result = await downloadResume()

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/resume')
    expect(fetchMock).toHaveBeenCalledWith(url)
    expect(result).toBe(blob)
  })

  it('downloadResume: S3 응답이 실패면 에러를 던진다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { url: 'https://bucket.s3.amazonaws.com/x', fileName: '이력서.pdf', expiresAt: '' },
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }))

    await expect(downloadResume()).rejects.toThrow('이력서 파일을 받지 못했습니다. (403)')
  })

  it('deleteResume: DELETE /api/me/resume을 호출한다', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 })

    await deleteResume()

    expect(apiClient.delete).toHaveBeenCalledWith('/api/me/resume')
  })
})
