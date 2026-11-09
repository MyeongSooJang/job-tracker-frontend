import type { GrowthStage } from '@/lib/studyLog'

type Stage = GrowthStage['stage']

interface SproutIllustrationProps {
  stage: Stage
  label: string
  className?: string
}

// 오른쪽으로 뻗는 잎 한 장의 윤곽. 원점은 줄기에 붙는 점이고, 왼쪽 잎은 좌우를 뒤집어 그린다.
const LEAF_PATH = 'M0 0C0 -10 8 -16 18 -14C18 -4 10 2 0 0Z'

// 줄기 윗끝 높이(stemTop)와 잎이 붙는 높이(y)·크기(scale). single은 잎이 한 장뿐인 싹 단계다.
const SHAPES: Record<
  Exclude<Stage, 0>,
  { stemTop: number; pairs: ReadonlyArray<{ y: number; scale: number }>; single?: boolean }
> = {
  1: { stemTop: 34, pairs: [{ y: 36, scale: 0.9 }], single: true },
  2: { stemTop: 28, pairs: [{ y: 32, scale: 1 }] },
  3: { stemTop: 18, pairs: [{ y: 40, scale: 0.7 }, { y: 26, scale: 1 }] },
  4: { stemTop: 12, pairs: [{ y: 42, scale: 0.6 }, { y: 32, scale: 0.8 }, { y: 21, scale: 1 }] },
  5: { stemTop: 14, pairs: [{ y: 42, scale: 0.6 }, { y: 33, scale: 0.8 }, { y: 25, scale: 0.9 }] },
}

export default function SproutIllustration({ stage, label, className }: SproutIllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={label} className={className}>
      <path d="M8 56h48c0-7-10-10-24-10S8 49 8 56Z" className="fill-line" />
      {stage === 0 ? <ellipse cx="32" cy="47" rx="5" ry="3.5" className="fill-ink-600" /> : <Plant stage={stage} />}
    </svg>
  )
}

function Plant({ stage }: { stage: Exclude<Stage, 0> }) {
  const { stemTop, pairs, single } = SHAPES[stage]
  return (
    <>
      <rect x="30.5" y={stemTop} width="3" height={48 - stemTop} rx="1.5" className="fill-ink-900" />
      {pairs.map(({ y, scale }) => (
        <g key={y}>
          <path d={LEAF_PATH} transform={`translate(32 ${y}) scale(${scale})`} className="fill-leaf" />
          {!single && (
            <path d={LEAF_PATH} transform={`translate(32 ${y}) scale(${-scale} ${scale})`} className="fill-brand-500" />
          )}
        </g>
      ))}
      {stage === 5 && (
        <>
          {[0, 72, 144, 216, 288].map(angle => (
            <ellipse
              key={angle}
              cx="32"
              cy="8.5"
              rx="3.2"
              ry="4.5"
              transform={`rotate(${angle} 32 14)`}
              className="fill-heat-2"
            />
          ))}
          <circle cx="32" cy="14" r="3" className="fill-heat-4" />
        </>
      )}
    </>
  )
}
