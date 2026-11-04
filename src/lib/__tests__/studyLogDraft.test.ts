import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearDraft, draftKey, loadDraft, saveDraft, userIdFromToken } from '../studyLogDraft'

const base64url = (value: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const tokenWith = (payload: object) => `${base64url('{"alg":"HS256"}')}.${base64url(JSON.stringify(payload))}.signature`

describe('studyLogDraft', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  describe('userIdFromToken', () => {
    it('토큰 payload의 sub를 사용자 id로 꺼낸다', () => {
      expect(userIdFromToken(tokenWith({ sub: '7' }))).toBe('7')
    })

    it('base64url 문자(-, _)와 패딩 생략이 있는 payload도 읽는다', () => {
      const sub = '사용자?>>'
      expect(userIdFromToken(tokenWith({ sub }))).toBe(sub)
    })

    it('토큰이 없거나 형식이 틀리면 null이다', () => {
      expect(userIdFromToken(null)).toBeNull()
      expect(userIdFromToken('garbage')).toBeNull()
      expect(userIdFromToken('a.!!!.c')).toBeNull()
    })

    it('payload에 sub가 없거나 비어 있거나 문자열이 아니면 null이다', () => {
      expect(userIdFromToken(tokenWith({ name: 'x' }))).toBeNull()
      expect(userIdFromToken(tokenWith({ sub: '' }))).toBeNull()
      expect(userIdFromToken(tokenWith({ sub: 7 }))).toBeNull()
    })
  })

  describe('draftKey', () => {
    it('새 글은 날짜별로 키를 만든다', () => {
      expect(draftKey('7', { logId: null, date: '2026-10-20' })).toBe('study-log-draft:v1:7:new-2026-10-20')
    })

    it('기존 글은 글 id별로 키를 만든다', () => {
      expect(draftKey('7', { logId: 12, date: '2026-10-20' })).toBe('study-log-draft:v1:7:12')
    })

    it('사용자 id가 다르면 키도 다르다', () => {
      expect(draftKey('7', { logId: 12, date: 'd' })).not.toBe(draftKey('8', { logId: 12, date: 'd' }))
    })
  })

  describe('저장과 불러오기', () => {
    it('저장한 임시 글을 저장 시각과 함께 그대로 불러온다', () => {
      saveDraft('k', { title: '제목', content: '내용', minutesInput: '30' }, 1_700_000_000_000)

      expect(loadDraft('k')).toEqual({ title: '제목', content: '내용', minutesInput: '30', savedAt: 1_700_000_000_000 })
    })

    it('저장된 것이 없으면 null이다', () => {
      expect(loadDraft('none')).toBeNull()
    })

    it('지우면 더 이상 불러오지 않는다', () => {
      saveDraft('k', { title: 'a', content: 'b', minutesInput: '' })
      clearDraft('k')

      expect(loadDraft('k')).toBeNull()
    })

    it('JSON이 깨졌으면 null이다', () => {
      localStorage.setItem('k', '{not json')

      expect(loadDraft('k')).toBeNull()
    })

    it('모양이 틀리면 null이다', () => {
      localStorage.setItem('k', JSON.stringify({ title: 'a', content: 'b', minutesInput: 3, savedAt: 1 }))
      expect(loadDraft('k')).toBeNull()

      localStorage.setItem('k', JSON.stringify({ title: 'a', content: 'b', minutesInput: '', savedAt: 'x' }))
      expect(loadDraft('k')).toBeNull()

      localStorage.setItem('k', JSON.stringify({ title: 'a', content: 'b', minutesInput: '' }))
      expect(loadDraft('k')).toBeNull()

      localStorage.setItem('k', 'null')
      expect(loadDraft('k')).toBeNull()
    })

    it('저장소를 쓸 수 없어도 예외를 던지지 않는다', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked') })

      expect(loadDraft('k')).toBeNull()
      expect(() => saveDraft('k', { title: 'a', content: 'b', minutesInput: '' })).not.toThrow()
      expect(() => clearDraft('k')).not.toThrow()
    })
  })
})
