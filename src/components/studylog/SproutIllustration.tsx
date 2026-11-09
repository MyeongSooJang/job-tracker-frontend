import type { GrowthStage } from '@/lib/studyLog'

type Stage = GrowthStage['stage']

interface SproutIllustrationProps {
  stage: Stage
  label: string
  className?: string
}

// 오른쪽으로 뻗는 잎 한 장의 윤곽. 원점은 줄기에 붙는 점이고, 왼쪽 잎은 좌우를 뒤집어 그린다.
const LEAF_PATH = 'M0 0C0 -10 8 -16 18 -14C18 -4 10 2 0 0Z'

// 흙 둔덕. 식물은 이 둔덕 뒤에서 자라 나오게 그려 줄기 밑동이 흙에 묻힌다.
const SOIL_PATH = 'M6 57h52c0-9-12-13-26-13S6 48 6 57Z'

// 줄기 윗끝 높이(stemTop)와 잎이 붙는 높이(y)·크기(scale). single은 잎이 한 장뿐인 싹 단계다.
const SHAPES: Record<
  Exclude<Stage, 0>,
  { stemTop: number; pairs: ReadonlyArray<{ y: number; scale: number }>; single?: boolean }
> = {
  1: { stemTop: 34, pairs: [{ y: 36, scale: 0.9 }], single: true },
  2: { stemTop: 28, pairs: [{ y: 32, scale: 1 }] },
  3: { stemTop: 18, pairs: [{ y: 40, scale: 0.7 }, { y: 26, scale: 1 }] },
  4: { stemTop: 12, pairs: [{ y: 42, scale: 0.6 }, { y: 32, scale: 0.8 }, { y: 21, scale: 1 }] },
  5: { stemTop: 16, pairs: [{ y: 44, scale: 0.8 }, { y: 33, scale: 1 }] },
}

export default function SproutIllustration({ stage, label, className }: SproutIllustrationProps) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={label} className={className}>
      {stage === 0 ? (
        <Seed />
      ) : (
        <>
          <Plant stage={stage} />
          <path d={SOIL_PATH} className="fill-soil" />
        </>
      )}
    </svg>
  )
}

// 흙 속에서 싹틀 때를 기다리는 씨앗. 비어 보이지 않게 아직 나오지 않은 싹의 윤곽을 점선으로 남긴다.
function Seed() {
  return (
    <>
      <g fill="none" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 3.4" className="stroke-leaf">
        <path d="M32 40V26" />
        <path d="M32 29C32 22 38 18 45 19C45 25 40 30 32 29Z" />
      </g>
      <path d={SOIL_PATH} className="fill-soil" />
      <g transform="rotate(-18 32 47)">
        <path d="M32 39.5C37.5 41.5 39 48 32 53C25 48 26.5 41.5 32 39.5Z" className="fill-heat-4" />
        <ellipse cx="29.8" cy="45" rx="1.3" ry="3" className="fill-heat-2" />
      </g>
      <ellipse cx="25" cy="52" rx="5.5" ry="2.4" className="fill-soil" />
      <ellipse cx="39.5" cy="52.5" rx="6" ry="2.6" className="fill-soil" />
    </>
  )
}

function Plant({ stage }: { stage: Exclude<Stage, 0> }) {
  const { stemTop, pairs, single } = SHAPES[stage]
  return (
    <>
      <rect x="30.5" y={stemTop} width="3" height={50 - stemTop} rx="1.5" className="fill-ink-900" />
      {pairs.map(({ y, scale }) => (
        <g key={y}>
          <path d={LEAF_PATH} transform={`translate(32 ${y}) scale(${scale})`} className="fill-leaf" />
          {!single && (
            <path d={LEAF_PATH} transform={`translate(32 ${y}) scale(${-scale} ${scale})`} className="fill-brand-500" />
          )}
        </g>
      ))}
      {stage === 5 && <Flower />}
    </>
  )
}

// 바깥 꽃잎 여섯 장(금색) 위에 안쪽 꽃잎 여섯 장(호박색)을 어긋나게 겹치고 가운데에 씨방을 둔다.
function Flower() {
  return (
    <>
      {[0, 60, 120, 180, 240, 300].map(angle => (
        <ellipse key={angle} cx="32" cy="8" rx="3.6" ry="4.8" transform={`rotate(${angle} 32 15)`} className="fill-heat-2" />
      ))}
      {[30, 90, 150, 210, 270, 330].map(angle => (
        <ellipse key={angle} cx="32" cy="10.5" rx="2.6" ry="3.2" transform={`rotate(${angle} 32 15)`} className="fill-heat-3" />
      ))}
      <circle cx="32" cy="15" r="3.4" className="fill-heat-4" />
    </>
  )
}
