import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import {
  createStudyLog, deleteStudyLog, getHeatmap, getStudyLog, getStudyLogs, getStudyStats, updateStudyLog,
} from '@/api/studyLogs'

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('studyLogs API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getStudyLog: GET /api/me/study-logs/{id}를 호출한다', async () => {
    const log = { id: 7, studyDate: '2026-11-03', title: 'JPA', content: '내용', studyMinutes: 90 }
    vi.mocked(apiClient.get).mockResolvedValue({ data: log })

    const result = await getStudyLog(7)

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/study-logs/7')
    expect(result).toEqual(log)
  })

  it('getStudyLogs: from, to 쿼리 파라미터로 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] })

    await getStudyLogs('2026-10-06', '2026-11-04')

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/study-logs', {
      params: { from: '2026-10-06', to: '2026-11-04' },
    })
  })

  it('getHeatmap: GET /api/me/study-logs/heatmap을 from, to로 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [{ date: '2026-11-04', count: 2, minutes: 90 }] })

    const result = await getHeatmap('2025-11-02', '2026-11-04')

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/study-logs/heatmap', {
      params: { from: '2025-11-02', to: '2026-11-04' },
    })
    expect(result[0].count).toBe(2)
  })

  it('getStudyStats: GET /api/me/study-logs/stats를 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { currentStreak: 3, longestStreak: 21 } })

    const result = await getStudyStats()

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/study-logs/stats')
    expect(result.longestStreak).toBe(21)
  })

  it('createStudyLog: POST /api/me/study-logs로 본문을 보내고 만들어진 글을 돌려받는다', async () => {
    const created = { id: 7, studyDate: '2026-11-03', title: 'JPA', content: '내용', studyMinutes: 90 }
    vi.mocked(apiClient.post).mockResolvedValue({ data: created })

    const result = await createStudyLog({ studyDate: '2026-11-03', title: 'JPA', content: '내용', studyMinutes: 90 })

    expect(apiClient.post).toHaveBeenCalledWith('/api/me/study-logs', {
      studyDate: '2026-11-03', title: 'JPA', content: '내용', studyMinutes: 90,
    })
    expect(result).toEqual(created)
  })

  it('updateStudyLog: PUT /api/me/study-logs/{id}로 본문을 보낸다', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { id: 7 } })

    await updateStudyLog(7, { title: 'JPA', content: '내용', studyMinutes: 90 })

    expect(apiClient.put).toHaveBeenCalledWith('/api/me/study-logs/7', { title: 'JPA', content: '내용', studyMinutes: 90 })
  })

  it('deleteStudyLog: DELETE /api/me/study-logs/{id}를 호출한다', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 })

    await deleteStudyLog(7)

    expect(apiClient.delete).toHaveBeenCalledWith('/api/me/study-logs/7')
  })
})
