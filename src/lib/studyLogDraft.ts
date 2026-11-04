// 작성 중인 글을 브라우저에 임시로 보관한다. 뒤로가기 제스처나 토큰 만료로 화면이 사라져도 글을 되살리기 위함이다.
export interface StudyLogDraft {
  title: string
  content: string
  minutesInput: string
  savedAt: number
}

// JWT payload의 sub(사용자 id)를 꺼낸다. 형식이 틀리거나 토큰이 없으면 null.
// 서명은 검증하지 않는다(클라이언트에서는 키를 나누는 용도로만 쓴다).
export function userIdFromToken(token: string | null): string | null {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const bytes = Uint8Array.from(atob(padded), char => char.charCodeAt(0))
    const sub = (JSON.parse(new TextDecoder().decode(bytes)) as { sub?: unknown } | null)?.sub
    return typeof sub === 'string' && sub !== '' ? sub : null
  } catch {
    return null
  }
}

// 새 글은 날짜별로, 기존 글은 글 id별로 한 칸씩. 사용자 id가 들어가 같은 기기의 다른 계정에는 보이지 않는다.
export function draftKey(userId: string, scope: { logId: number | null; date: string }): string {
  return `study-log-draft:v1:${userId}:${scope.logId ?? `new-${scope.date}`}`
}

function isDraft(value: unknown): value is StudyLogDraft {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.title === 'string' && typeof v.content === 'string' && typeof v.minutesInput === 'string'
    && typeof v.savedAt === 'number' && Number.isFinite(v.savedAt)
}

export function loadDraft(key: string): StudyLogDraft | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return isDraft(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveDraft(key: string, draft: Omit<StudyLogDraft, 'savedAt'>, now: number = Date.now()): void {
  try {
    const value: StudyLogDraft = { title: draft.title, content: draft.content, minutesInput: draft.minutesInput, savedAt: now }
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장소를 쓸 수 없는 환경(용량 초과, 사생활 보호 모드 등)에서는 임시 저장 없이 계속 쓴다.
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // 위와 동일
  }
}
