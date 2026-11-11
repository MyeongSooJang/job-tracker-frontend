import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import { createApplication, updateApplicationJobSite } from '@/api/applications'

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

describe('applications API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createApplication: 지원 사이트를 요청 본문에 담아 POST /api/applications를 호출한다', async () => {
    const req = { companyId: 1, position: '백엔드', appliedDate: '2026-11-01', jobSite: 'SARAMIN' as const }
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 1 } })

    await createApplication(req)

    expect(apiClient.post).toHaveBeenCalledWith('/api/applications', req)
  })

  it('updateApplicationJobSite: PATCH /api/applications/{id}/job-site에 jobSite를 보낸다', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { id: 7, jobSite: 'WANTED' } })

    const result = await updateApplicationJobSite(7, 'WANTED')

    expect(apiClient.patch).toHaveBeenCalledWith('/api/applications/7/job-site', { jobSite: 'WANTED' })
    expect(result.jobSite).toBe('WANTED')
  })
})
