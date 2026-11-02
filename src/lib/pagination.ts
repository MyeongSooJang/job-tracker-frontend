// 페이지 번호는 1부터 시작하며 [1, total] 범위로 제한한다.
export function clampPage(page: number, total: number): number {
  return Math.min(Math.max(page, 1), Math.max(total, 1))
}
