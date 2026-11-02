import { describe, it, expect } from 'vitest'
import { filterCompanies } from '../companySearch'

const companies = [
  { name: '네이버', industry: 'IT' },
  { name: '카카오', industry: 'IT' },
  { name: 'Coupang', industry: '커머스' },
]

describe('filterCompanies', () => {
  it('검색어가 비어 있으면 전체를 돌려준다', () => {
    expect(filterCompanies(companies, '')).toEqual(companies)
    expect(filterCompanies(companies, '   ')).toEqual(companies)
  })

  it('회사명 부분 일치로 찾는다', () => {
    expect(filterCompanies(companies, '카카')).toEqual([companies[1]])
  })

  it('업종으로도 찾는다', () => {
    expect(filterCompanies(companies, '커머스')).toEqual([companies[2]])
  })

  it('대소문자와 앞뒤 공백을 무시한다', () => {
    expect(filterCompanies(companies, '  COUPANG ')).toEqual([companies[2]])
  })

  it('일치하는 회사가 없으면 빈 배열이다', () => {
    expect(filterCompanies(companies, '없는회사')).toEqual([])
  })

  it('업종이 비어 있는 회사도 오류 없이 처리한다', () => {
    expect(filterCompanies([{ name: '토스', industry: '' }], '핀테크')).toEqual([])
  })
})
