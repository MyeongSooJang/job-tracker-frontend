interface Searchable {
  name: string
  industry: string
}

// 회사명과 업종에서 대소문자·앞뒤 공백을 무시하고 부분 일치로 찾는다.
export function filterCompanies<T extends Searchable>(companies: T[], query: string): T[] {
  const keyword = query.trim().toLowerCase()
  if (keyword === '') return companies
  return companies.filter(
    c =>
      c.name.toLowerCase().includes(keyword) ||
      (c.industry ?? '').toLowerCase().includes(keyword),
  )
}
