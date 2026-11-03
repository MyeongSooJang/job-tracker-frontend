import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'
import { apiClient } from '@/lib/axios'
import {
  deleteStudyLog, getRecentStudyLogs, getStudyLog, getStudyLogsByMonth, getStudyStats, saveStudyLog,
} from '@/api/studyLogs'

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const httpError = (status: number) =>
  new AxiosError('fail', String(status), undefined, undefined, { status } as never)

describe('studyLogs API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getStudyLog: GET /api/me/study-logs/{date}를 호출한다', async () => {
    const log = { id: 1, studyDate: '2026-11-03', content: 'JPA', studyMinutes: 90 }
    vi.mocked(apiClient.get).mockResolvedValue({ data: log })

    const result = await getStudyLog('2026-11-03')

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/study-logs/2026-11-03')
    expect(result).toEqual(log)
  })

  it('getStudyLog: 기록이 없어 404이면 null을 돌려준다', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(httpError(404))

    await expect(getStudyLog('2026-11-03')).resolves.toBeNull()
  })

  it('getStudyLog: 404가 아닌 오류는 그대로 던진다', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(httpError(500))

    await expect(getStudyLog('2026-11-03')).rejects.toBeInstanceOf(AxiosError)
  })

  it('getStudyLogsByMonth: month 쿼리 파라미터로 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] })

    await getStudyLogsByMonth('2026-11')

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/study-logs', { params: { month: '2026-11' } })
  })

  it('getRecentStudyLogs: GET /api/me/study-logs/recent를 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] })

    await getRecentStudyLogs()

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/study-logs/recent')
  })

  it('getStudyStats: GET /api/me/study-logs/stats를 호출한다', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { currentStreak: 3 } })

    const result = await getStudyStats()

    expect(apiClient.get).toHaveBeenCalledWith('/api/me/study-logs/stats')
    expect(result.currentStreak).toBe(3)
  })

  it('saveStudyLog: PUT /api/me/study-logs/{date}로 본문을 보낸다', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: { id: 1 } })

    await saveStudyLog('2026-11-03', { content: 'JPA', studyMinutes: 90 })

    expect(apiClient.put).toHaveBeenCalledWith('/api/me/study-logs/2026-11-03', { content: 'JPA', studyMinutes: 90 })
  })

  it('deleteStudyLog: DELETE /api/me/study-logs/{date}를 호출한다', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 })

    await deleteStudyLog('2026-11-03')

    expect(apiClient.delete).toHaveBeenCalledWith('/api/me/study-logs/2026-11-03')
  })
})
