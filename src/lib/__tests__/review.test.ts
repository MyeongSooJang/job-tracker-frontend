import { describe, it, expect } from 'vitest'
import { difficultyLabel, isWritten, joinQuestions, parseQuestions } from '../review'

describe('parseQuestions', () => {
  it('줄마다 질문 하나로 나눈다', () => {
    expect(parseQuestions('자기소개\n프로젝트 경험')).toEqual(['자기소개', '프로젝트 경험'])
  })

  it('앞뒤 공백을 지우고 빈 줄은 버린다', () => {
    expect(parseQuestions('  자기소개  \n\n   \n프로젝트 경험\n')).toEqual(['자기소개', '프로젝트 경험'])
  })

  it('빈 문자열이면 빈 목록이다', () => {
    expect(parseQuestions('')).toEqual([])
  })
})

describe('joinQuestions', () => {
  it('질문을 줄바꿈으로 이어 붙인다', () => {
    expect(joinQuestions(['자기소개', '프로젝트 경험'])).toBe('자기소개\n프로젝트 경험')
  })

  it('질문이 없거나 undefined면 빈 문자열이다', () => {
    expect(joinQuestions([])).toBe('')
    expect(joinQuestions(undefined)).toBe('')
  })
})

describe('difficultyLabel', () => {
  it('1~5점을 쉬움에서 어려움까지 라벨로 바꾼다', () => {
    expect(difficultyLabel(1)).toBe('매우 쉬움')
    expect(difficultyLabel(3)).toBe('보통')
    expect(difficultyLabel(5)).toBe('매우 어려움')
  })
})

describe('isWritten', () => {
  it('본문이 있으면 작성된 기록이다', () => {
    expect(isWritten({ content: '분위기가 좋았다' })).toBe(true)
  })

  it('서버가 자동으로 만든 본문 없는 기록은 작성 전이다', () => {
    expect(isWritten({ content: null })).toBe(false)
    expect(isWritten({ content: '' })).toBe(false)
  })
})
