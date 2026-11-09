import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import SproutIllustration from '@/components/studylog/SproutIllustration'
import { Button } from '@/components/ui/button'
import { growthStage, type GrowthStage } from '@/lib/studyLog'

type Stage = GrowthStage['stage']

// 앱의 새싹은 연속 작성일 10일마다 한 단계 자란다. 소개 페이지는 같은 기준의 일수를 그대로 보여준다.
const STAGE_DAYS = [0, 10, 20, 30, 40, 50] as const

const sectionClass = 'flex min-h-[85vh] flex-col justify-center px-6 py-16 sm:px-10 lg:min-h-screen lg:px-16'
// 한국어는 단어 단위로 줄을 바꾸고(break-keep), 제목은 줄 길이를 고르게, 본문은 마지막 줄이 한 단어만 남지 않게 맞춘다.
const headingClass = 'break-keep text-3xl font-bold tracking-tight text-ink-900 [text-wrap:balance] sm:text-4xl'
const bodyClass = 'mt-4 max-w-md break-keep text-base leading-relaxed text-ink-600 [text-wrap:pretty]'

// 지원 단계. 실제 데이터가 아니라 서비스가 다루는 상태 이름만 보여주는 장식이다.
function StatusPath() {
  const steps = ['서류 제출', '면접', '합격']
  return (
    <div aria-hidden className="mt-8 flex items-center gap-2">
      {steps.map((label, index) => (
        <div key={label} className="flex items-center gap-2">
          {index > 0 && <span className="h-px w-5 bg-line" />}
          <span
            className={
              index === 1
                ? 'rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white'
                : 'rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700'
            }
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// 잔디 한 줄. 단계 색을 늘어놓은 장식이며 실제 기록이 아니다.
const HEAT_CLASS = ['bg-line', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']

function HeatStrip() {
  return (
    <div aria-hidden className="mt-8 flex items-center gap-1.5 text-xs text-ink-600">
      <span className="mr-1">적게</span>
      {HEAT_CLASS.map(color => (
        <span key={color} className={`h-4 w-4 rounded-[3px] ${color}`} />
      ))}
      <span className="ml-1">많이</span>
    </div>
  )
}

interface ActionsProps {
  isAuthenticated: boolean
  from: string | undefined
}

function Actions({ isAuthenticated, from }: ActionsProps) {
  if (isAuthenticated) {
    return (
      <div className="mt-10">
        <Button asChild variant="brand" size="lg">
          <Link to="/">내 화면으로 가기</Link>
        </Button>
      </div>
    )
  }
  return (
    <div className="mt-10 flex items-center gap-6">
      <Button asChild variant="brand" size="lg">
        <Link to="/login" state={from ? { from } : undefined}>로그인</Link>
      </Button>
      <Link to="/signup" className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline">
        회원가입
      </Link>
    </div>
  )
}

export default function Intro() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const [stage, setStage] = useState<Stage>(0)
  const flowRef = useRef<HTMLDivElement>(null)

  // 화면 가운데를 지나는 글 영역의 단계로 식물을 바꾼다.
  useEffect(() => {
    const flow = flowRef.current
    if (!flow || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setStage(Number((entry.target as HTMLElement).dataset.stage) as Stage)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    flow.querySelectorAll('[data-stage]').forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const days = STAGE_DAYS[stage]
  const growth = growthStage(days)
  const actions = <Actions isAuthenticated={isAuthenticated} from={from} />

  return (
    <div className="min-h-screen bg-surface font-sans selection:bg-brand-100 lg:flex">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-line bg-surface px-4 py-3 lg:h-screen lg:w-5/12 lg:shrink-0 lg:flex-col lg:justify-center lg:gap-6 lg:border-b-0 lg:px-0 lg:py-0">
        <div className="flex items-center gap-2.5 lg:absolute lg:left-10 lg:top-8">
          <img src="/brand/mark-light.svg" alt="" className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight text-ink-900">쌍떡잎</span>
        </div>
        <div key={stage} className="animate-grow origin-bottom motion-reduce:animate-none">
          <SproutIllustration
            stage={stage}
            label={`새싹 ${stage + 1}단계 ${growth.name}`}
            className="h-24 w-24 lg:h-auto lg:w-[min(26rem,32vw)]"
          />
        </div>
        <p className="text-sm font-medium tabular-nums text-ink-600 lg:text-base">
          연속 {days}일 · {growth.name}
        </p>
      </div>

      <main ref={flowRef} className="min-w-0 flex-1">
        <section data-stage={0} className={sectionClass}>
          <h1 className="break-keep text-5xl font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">쓴 만큼 자라요.</h1>
          <p className="mt-6 max-w-md break-keep text-lg leading-relaxed text-ink-600 [text-wrap:pretty]">
            연속으로 기록할수록 싹이 자라는 취업 준비 기록장. 지원 현황, 면접 질문과 답변, 매일 공부한 글을 한곳에 모아요.
          </p>
          {actions}
        </section>

        <section data-stage={1} className={sectionClass}>
          <h2 className={headingClass}>어디까지 왔는지 한눈에</h2>
          <p className={bodyClass}>
            회사마다 지원한 포지션과 진행 상태를 적어두세요. 서류 제출부터 면접, 합격·불합격까지 지원 한 건씩 이어서 볼 수 있어요.
          </p>
          <StatusPath />
        </section>

        <section data-stage={2} className={sectionClass}>
          <h2 className={headingClass}>면접에서 받은 질문과 내 답변</h2>
          <p className={bodyClass}>
            면접마다 받은 질문과 그때 한 답변을 남겨요. 다음 면접 전에 다시 꺼내 보면 같은 질문에 더 잘 답할 수 있어요.
          </p>
        </section>

        <section data-stage={3} className={sectionClass}>
          <h2 className={headingClass}>다가오는 일정을 놓치지 않게</h2>
          <p className={bodyClass}>
            면접, 과제 제출, 서류 마감 날짜를 일정으로 모아두고 지원 건과 함께 확인해요.
          </p>
        </section>

        <section data-stage={4} className={sectionClass}>
          <h2 className={headingClass}>오늘 공부한 걸 글로 남겨요</h2>
          <p className={bodyClass}>
            노션처럼 쓰는 에디터에 개념 정리, 비교 표, 면접 예상 질문을 적어요. 글을 쓴 날은 잔디에 칠해지고, 연속으로 쓴 날수만큼 왼쪽의 새싹이 자라요.
          </p>
          <HeatStrip />
        </section>

        <section data-stage={5} className={sectionClass}>
          <h2 className={headingClass}>오늘 한 줄부터.</h2>
          <p className={bodyClass}>첫 기록이 씨앗이에요. 오늘 공부한 것 하나만 적어도 시작할 수 있어요.</p>
          {actions}
        </section>
      </main>
    </div>
  )
}
