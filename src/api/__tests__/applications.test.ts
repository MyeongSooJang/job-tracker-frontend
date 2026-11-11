import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import { getJobSiteStats } from '@/api/applications'

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn() },
}))

describe('applications API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getJobSiteStats: GET /api/applications/stats/job-site를 호출하고 응답 본문을 돌려준다', async () => {
    const stats = [
      { jobSite: 'SARAMIN', applicationCount: 10, documentPassedCount: 3, documentPassRate: 0.3 },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: stats })

    const result = await getJobSiteStats()

    expect(apiClient.get).toHaveBeenCalledWith('/api/applications/stats/job-site')
    expect(result).toEqual(stats)
  })
})
