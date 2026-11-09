import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'

const cardClass = 'rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]'

// 지원 단계 그림. 실제 데이터가 아니라 서비스가 다루는 상태 이름만 보여주는 장식이다.
function StatusArt() {
  return (
    <div aria-hidden className="flex h-24 flex-wrap content-center gap-2">
      {['서류 제출', '면접', '합격'].map((label, index) => (
        <span
          key={label}
          className={
            index === 1
              ? 'rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white'
              : 'rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700'
          }
        >
          {label}
        </span>
      ))}
    </div>
  )
}

// 질문과 답변 말풍선 그림. 내용 대신 줄만 그려서 가짜 문장을 만들지 않는다.
function QuestionArt() {
  return (
    <div aria-hidden className="flex h-24 flex-col justify-center gap-2">
      <div className="w-4/5 space-y-1.5 rounded-lg rounded-bl-sm bg-surface p-2.5">
        <div className="h-1.5 w-full rounded bg-line" />
        <div className="h-1.5 w-2/3 rounded bg-line" />
      </div>
      <div className="ml-auto w-3/4 space-y-1.5 rounded-lg rounded-br-sm bg-brand-50 p-2.5">
        <div className="h-1.5 w-full rounded bg-brand-100" />
        <div className="h-1.5 w-1/2 rounded bg-brand-100" />
      </div>
    </div>
  )
}

// 잔디 그림. 단계 색을 규칙적으로 늘어놓은 장식이며 실제 기록이 아니다.
const HEAT_PATTERN = [0, 1, 0, 2, 1, 0, 3, 1, 2, 0, 4, 2, 1, 3, 0, 2, 4, 1, 0, 3, 2, 1, 4, 3, 0, 1, 2, 4]
const HEAT_CLASS = ['bg-surface', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']

function HeatmapArt() {
  return (
    <div aria-hidden className="grid h-24 grid-flow-col grid-rows-4 content-center justify-start gap-1">
      {HEAT_PATTERN.map((level, index) => (
        <span key={index} className={`h-4 w-4 rounded-[3px] ${HEAT_CLASS[level]}`} />
      ))}
    </div>
  )
}

const FEATURES = [
  {
    title: '지원 현황 관리',
    description: '회사별로 지원한 포지션과 진행 상태를 한곳에서 확인하고, 일정도 함께 챙겨요.',
    art: <StatusArt />,
  },
  {
    title: '면접 기록',
    description: '면접마다 받은 질문과 내 답변을 남겨서 다음 면접을 더 잘 준비해요.',
    art: <QuestionArt />,
  },
  {
    title: '학습 기록',
    description: '매일 공부한 내용을 글로 남기고, 잔디와 연속 작성일로 꾸준함을 확인해요.',
    art: <HeatmapArt />,
  },
]

export default function Intro() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  return (
    <div className="min-h-screen bg-surface font-sans">
      <header className="mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-6 sm:px-6">
        <img src="/brand/mark-light.svg" alt="" className="h-8 w-8" />
        <span className="text-lg font-bold tracking-tight text-ink-900">쌍떡잎</span>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <section className="py-10 text-center sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">취업 준비의 기록을 한곳에</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-600">
            지원 현황, 면접 기록, 매일의 학습을 이어서 보여주는 개인용 취업 준비 서비스예요.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Button asChild variant="brand" size="lg">
                <Link to="/">내 화면으로 가기</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="brand" size="lg">
                  <Link to="/login" state={from ? { from } : undefined}>로그인</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/signup">회원가입</Link>
                </Button>
              </>
            )}
          </div>
        </section>

        <section aria-label="주요 기능" className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(feature => (
            <article key={feature.title} className={cardClass}>
              {feature.art}
              <h2 className="mt-4 text-base font-semibold text-ink-900">{feature.title}</h2>
              <p className="mt-1.5 text-sm text-ink-600">{feature.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
