import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import { getCompanies, createCompany } from '@/api/companies'

vi.mock('@/lib/axios', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}))

describe('companies API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getCompanies: GET /api/companies를 호출한다', async () => {
    const mockData = [{ id: 1, name: '카카오', industry: 'IT', website: 'https://kakao.com', createdAt: '' }]
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })

    const result = await getCompanies()

    expect(apiClient.get).toHaveBeenCalledWith('/api/companies')
    expect(result).toEqual(mockData)
  })

  it('createCompany: POST /api/companies를 호출한다', async () => {
    const req = { name: '카카오', industry: 'IT', website: 'https://kakao.com' }
    const mockData = { id: 1, ...req, createdAt: '' }
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockData })

    const result = await createCompany(req)

    expect(apiClient.post).toHaveBeenCalledWith('/api/companies', req)
    expect(result.name).toBe('카카오')
  })
})
