import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import {
  createApplication,
  getJobSiteStats,
  updateApplicationDeadline,
  updateApplicationJobSite,
  updateApplicationResumeView,
} from '@/api/applications'

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

  it('getJobSiteStats: GET /api/applications/stats/job-site를 호출하고 응답 본문을 돌려준다', async () => {
    const stats = [
      { jobSite: 'SARAMIN', applicationCount: 10, documentPassedCount: 3, documentPassRate: 0.3 },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: stats })

    const result = await getJobSiteStats()

    expect(apiClient.get).toHaveBeenCalledWith('/api/applications/stats/job-site')
    expect(result).toEqual(stats)
  })

  it('createApplication: 마감일이 있으면 요청 본문에 함께 담는다', async () => {
    const req = { companyId: 1, position: '백엔드', appliedDate: '2026-11-01', jobSite: 'SARAMIN' as const, deadline: '2026-11-30' }
    vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 1 } })

    await createApplication(req)

    expect(apiClient.post).toHaveBeenCalledWith('/api/applications', req)
  })

  it('updateApplicationDeadline: PATCH /api/applications/{id}/deadline에 deadline을 보낸다', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { id: 7, deadline: '2026-11-30' } })

    const result = await updateApplicationDeadline(7, '2026-11-30')

    expect(apiClient.patch).toHaveBeenCalledWith('/api/applications/7/deadline', { deadline: '2026-11-30' })
    expect(result.deadline).toBe('2026-11-30')
  })

  it('updateApplicationResumeView: PATCH /api/applications/{id}/resume-view에 resumeView를 보낸다', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { id: 7, resumeView: 'VIEWED' } })

    const result = await updateApplicationResumeView(7, 'VIEWED')

    expect(apiClient.patch).toHaveBeenCalledWith('/api/applications/7/resume-view', { resumeView: 'VIEWED' })
    expect(result.resumeView).toBe('VIEWED')
  })
})
