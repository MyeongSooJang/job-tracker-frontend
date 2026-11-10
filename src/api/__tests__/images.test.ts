import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/axios'
import { toDisplayUrl, uploadImage } from '../images'

describe('uploadImage', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('파일을 multipart로 올리고 본문에 넣을 경로를 돌려준다', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { url: '/api/images/abc' } })
    const file = new File(['x'], 'a.png', { type: 'image/png' })

    const url = await uploadImage(file)

    expect(url).toBe('/api/images/abc')
    const [path, body, config] = post.mock.calls[0]
    expect(path).toBe('/api/me/images')
    expect((body as FormData).get('file')).toBe(file)
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
  })
})

describe('toDisplayUrl', () => {
  it('본문의 이미지 경로에는 API 주소를 붙인다', () => {
    apiClient.defaults.baseURL = 'https://api.example.com/'

    expect(toDisplayUrl('/api/images/abc')).toBe('https://api.example.com/api/images/abc')
  })

  it('외부 링크나 다른 경로는 그대로 둔다', () => {
    expect(toDisplayUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
    expect(toDisplayUrl('/api/me/images')).toBe('/api/me/images')
  })
})
