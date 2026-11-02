// 페이지 번호는 1부터 시작하며 [1, total] 범위로 제한한다.
export function clampPage(page: number, total: number): number {
  return Math.min(Math.max(page, 1), Math.max(total, 1))
}

// 항목이 없어도 화면에는 1페이지가 있다.
export function totalPages(totalItems: number, pageSize: number): number {
  return Math.max(Math.ceil(totalItems / pageSize), 1)
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const current = clampPage(page, totalPages(items.length, pageSize))
  const start = (current - 1) * pageSize
  return items.slice(start, start + pageSize)
}
