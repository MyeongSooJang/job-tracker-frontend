import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import SproutIllustration from '@/components/studylog/SproutIllustration'
import DifficultyMeter from '@/components/reviews/DifficultyMeter'
import RatingStars from '@/components/reviews/RatingStars'
import { Button } from '@/components/ui/button'
import { ATMOSPHERE_LABELS } from '@/lib/review'
import { growthStage, type GrowthStage } from '@/lib/studyLog'

type Stage = GrowthStage['stage']

// 앱의 새싹은 연속 작성일 10일마다 한 단계 자란다. 소개 페이지는 같은 기준의 일수를 그대로 보여준다.
const STAGE_DAYS = [0, 10, 20, 30, 40, 50] as const

const sectionClass = 'flex min-h-[70vh] flex-col justify-center px-6 py-16 sm:px-10 lg:min-h-[90vh] lg:px-16'
// 한국어는 단어 단위로 줄을 바꾸고(break-keep), 제목은 줄 길이를 고르게, 본문은 마지막 줄이 한 단어만 남지 않게 맞춘다.
const headingClass = 'break-keep text-3xl font-bold tracking-tight text-ink-900 [text-wrap:balance] sm:text-4xl lg:text-5xl'
const bodyClass = 'mt-4 max-w-md break-keep text-base leading-relaxed text-ink-600 [text-wrap:pretty]'

// 실제 데이터가 아니라 모양을 보여주는 그림에는 모두 이 표시를 붙인다. 흰 카드 안에서는 크림색 바탕으로 구분한다.
function ExampleTag({ onCard = false }: { onCard?: boolean }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium text-ink-600 ${onCard ? 'bg-surface' : 'bg-white'}`}>
      예시
    </span>
  )
}

// 지원 단계. 서비스가 다루는 상태 이름만 보여준다. 줄이 오른쪽 끝까지 이어져 지원이 흘러가는 모양을 만든다.
function StatusPath() {
  const steps = ['서류 제출', '면접', '합격']
  return (
    <div className="mt-8 max-w-xl">
      <ExampleTag />
      <div aria-hidden className="mt-3 flex items-center gap-3">
        {steps.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-3 last:flex-none">
            <span
              className={
                index === 1
                  ? 'rounded-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white'
                  : 'rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700'
              }
            >
              {label}
            </span>
            {index < steps.length - 1 && <span className="h-px flex-1 bg-line" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// 면접을 회차별로 적고 후기까지 정리하는 모양을 보여주는 예시. 일반적인 개념 질문이며 실제 면접 기록이 아니다.
// 별점, 난이도, 분위기는 앱의 면접 후기 화면에서 쓰는 컴포넌트와 표기를 그대로 쓴다.
function InterviewExample() {
  return (
    <div className="mt-8 max-w-lg overflow-hidden rounded-xl border border-line bg-white">
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between gap-3">
          <ExampleTag onCard />
          <div aria-hidden className="flex gap-1.5">
            <span className="rounded-full bg-brand-500 px-3 py-0.5 text-xs font-medium text-white">1차</span>
            <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-medium text-brand-700">2차</span>
          </div>
        </div>
        <h3 className="mt-3 text-base font-semibold text-ink-900">1차 면접</h3>
        <dl className="mt-1 flex flex-wrap gap-x-5 text-sm text-ink-600">
          <div className="flex gap-1.5">
            <dt>장소</dt>
            <dd className="text-ink-900">온라인</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>점수</dt>
            <dd className="text-ink-900">—</dd>
          </div>
        </dl>
        <p className="mt-4 break-keep text-sm font-semibold text-ink-900">프로세스와 스레드의 차이를 설명해 주세요.</p>
      </div>
      <div className="mt-3 border-t border-line bg-brand-50 px-5 py-4">
        <p className="break-keep text-sm leading-relaxed text-ink-900">
          프로세스는 독립된 메모리 공간을 가지고, 스레드는 한 프로세스 안에서 코드와 힙을 공유합니다.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-5 py-3">
        <span className="text-xs font-medium text-ink-600">후기</span>
        <RatingStars value={4} size={14} />
        <DifficultyMeter value={3} />
        <span className="text-xs text-ink-600">분위기 {ATMOSPHERE_LABELS.COMFORTABLE}</span>
      </div>
    </div>
  )
}

// 일정 종류와 설명. 날짜와 회사는 넣지 않고 종류별로 어떤 일정인지만 보여준다.
const SCHEDULE_EXAMPLES = [
  { type: '면접', title: '1차 면접' },
  { type: '과제 제출', title: '코딩 테스트' },
  { type: '서류 마감', title: '지원서 제출' },
]

function ScheduleExample() {
  return (
    <div className="mt-8 max-w-md">
      <ExampleTag />
      <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-white">
        {SCHEDULE_EXAMPLES.map(({ type, title }) => (
          <li key={type} className="flex items-baseline gap-4 px-4 py-3">
            <span className="w-16 shrink-0 text-sm font-medium text-brand-700">{type}</span>
            <span className="text-sm text-ink-900">{title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// 잔디 예시. 26주 x 7일 칸을 규칙적인 값으로 칠한 그림이며 실제 기록이 아니다. 좁은 화면에서는 16주만 보여준다.
const HEAT_WEEKS = 26
const HEAT_WEEKS_NARROW = 16
const HEAT_CLASS = ['bg-line', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']

function heatLevel(index: number) {
  const value = (index * 37 + 11) % 100
  if (value < 30) return 0
  if (value < 55) return 1
  if (value < 75) return 2
  if (value < 90) return 3
  return 4
}

function HeatGrid() {
  return (
    <div className="mt-8">
      <ExampleTag />
      <div aria-hidden className="mt-3 grid grid-flow-col grid-rows-7 justify-start gap-1">
        {Array.from({ length: HEAT_WEEKS * 7 }, (_, index) => (
          <span
            key={index}
            className={`h-3.5 w-3.5 rounded-[3px] ${HEAT_CLASS[heatLevel(index)]} ${index >= HEAT_WEEKS_NARROW * 7 ? 'hidden sm:block' : ''}`}
          />
        ))}
      </div>
      <div aria-hidden className="mt-3 flex items-center gap-1.5 text-xs text-ink-600">
        <span className="mr-1">적게</span>
        {HEAT_CLASS.map(color => (
          <span key={color} className={`h-3.5 w-3.5 rounded-[3px] ${color}`} />
        ))}
        <span className="ml-1">많이</span>
      </div>
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

  // 이 페이지가 열려 있는 동안만 스크롤바 색을 브랜드에 맞춘다.
  useEffect(() => {
    document.documentElement.classList.add('intro-scrollbar')
    return () => document.documentElement.classList.remove('intro-scrollbar')
  }, [])

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
        <div key={stage} className="shrink-0 animate-grow origin-bottom motion-reduce:animate-none">
          <SproutIllustration
            stage={stage}
            label={`새싹 ${stage + 1}단계 ${growth.name}`}
            className="h-28 w-28 lg:h-auto lg:w-[min(28rem,34vw)]"
          />
        </div>
        <div className="min-w-0 flex-1 lg:flex-none lg:text-center">
          {/* 데스크톱에서는 wrapper를 없애고 로고는 왼쪽 위, 로그인은 오른쪽 위에 둔다 */}
          <div className="flex items-center justify-between gap-3 lg:contents">
            <div className="flex items-center gap-2 lg:absolute lg:left-10 lg:top-8 lg:gap-2.5">
              <img src="/brand/mark-light.svg" alt="" className="h-6 w-6 lg:h-7 lg:w-7" />
              <span className="text-base font-bold tracking-tight text-ink-900 lg:text-lg">쌍떡잎</span>
            </div>
            {!isAuthenticated && (
              <Link
                to="/login"
                state={from ? { from } : undefined}
                className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline lg:fixed lg:right-10 lg:top-8"
              >
                로그인
              </Link>
            )}
          </div>
          <p className="mt-2 text-sm font-medium tabular-nums text-ink-900 lg:mt-0 lg:text-base">
            연속 {days}일 · {growth.name}
          </p>
          <p className="mt-0.5 break-keep text-xs text-ink-600 lg:text-sm">연속 기록 10일마다 한 단계씩 자라요</p>
        </div>
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
          <h2 className={headingClass}>면접을 회차별로 관리해요</h2>
          <p className={bodyClass}>
            1차, 2차 면접마다 장소와 점수를 적고 받은 질문과 내 답변을 남겨요. 면접이 끝나면 별점과 난이도, 분위기로 후기도 정리하고, 회사별 후기는 익명으로 모아 볼 수 있어요.
          </p>
          <InterviewExample />
        </section>

        <section data-stage={3} className={sectionClass}>
          <h2 className={headingClass}>다가오는 일정을 놓치지 않게</h2>
          <p className={bodyClass}>
            면접, 과제 제출, 서류 마감 날짜를 일정으로 모아두고 지원 건과 함께 확인해요.
          </p>
          <ScheduleExample />
        </section>

        <section data-stage={4} className={sectionClass}>
          <h2 className={`${headingClass} lg:text-6xl`}>오늘 공부한 걸 글로 남겨요</h2>
          <p className={bodyClass}>
            노션처럼 쓰는 에디터에 개념 정리, 비교 표, 면접 예상 질문을 적어요. 글을 쓴 날은 잔디에 칠해지고, 연속으로 쓴 날수만큼 왼쪽의 새싹이 자라요.
          </p>
          <HeatGrid />
        </section>

        <section data-stage={5} className={sectionClass}>
          <h2 className={`${headingClass} lg:text-6xl`}>오늘 한 줄부터.</h2>
          <p className={bodyClass}>첫 기록이 씨앗이에요. 오늘 공부한 것 하나만 적어도 시작할 수 있어요.</p>
          {actions}
        </section>
      </main>
    </div>
  )
}
