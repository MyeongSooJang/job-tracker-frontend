import type { GrowthStage } from '@/lib/studyLog'

type Stage = GrowthStage['stage']

interface SproutIllustrationProps {
  stage: Stage
  label: string
  className?: string
}

// 오른쪽 위로 뻗는 잎 한 장의 윤곽. 원점은 줄기에 붙는 점이고, 왼쪽 잎은 좌우를 뒤집어 그린다.
const LEAF_PATH = 'M0 0C0 -13 11 -21 24 -18C24 -5 13 3 0 0Z'

// 줄기에 달리는 잎 쌍의 높이(y)와 크기(scale). 위로 갈수록 커진다.
const LEAF_PAIRS = [
  { y: 68, scale: 0.55 },
  { y: 58, scale: 0.75 },
  { y: 47, scale: 0.95 },
] as const

// 나무 한 단: 가운데 x, 가운데 y, 가로·세로 반지름. 위로 갈수록 작아진다.
const TIERS = {
  4: [
    { cy: 58, rx: 21, ry: 14 },
    { cy: 44, rx: 15, ry: 12 },
  ],
  5: [
    { cy: 58, rx: 23, ry: 14 },
    { cy: 44, rx: 17, ry: 12 },
    { cy: 31, rx: 11, ry: 9.5 },
  ],
} as const

// 꽃 핀 나무의 꽃 자리
const BLOSSOMS = [
  [32, 60],
  [44, 67],
  [60, 63],
  [65, 54],
  [38, 45],
  [57, 41],
  [48, 28],
] as const

// 색은 모두 tailwind.config.js 토큰(leaf, brand, heat, ink)에서 가져온다. 그라데이션 색 멈춤은 Tailwind 클래스로 토큰을 읽는다.
export default function SproutIllustration({ stage, label, className }: SproutIllustrationProps) {
  return (
    <svg viewBox="4 8 88 88" role="img" aria-label={label} className={className}>
      <Defs />
      <Ground />
      {/* 식물은 흙 중앙(48, 80)을 기준으로 키워 그린다 */}
      <g transform="translate(48 80) scale(1.15) translate(-48 -80)">
        {stage === 0 && <Seed />}
        {stage === 1 && <Sprout />}
        {stage === 2 && <Cotyledons />}
        {stage === 3 && <Leafy />}
        {(stage === 4 || stage === 5) && <Tree stage={stage} />}
      </g>
      <Props />
    </svg>
  )
}

function Defs() {
  return (
    <defs>
      <linearGradient id="sprout-leaf" x1="0.15" y1="0" x2="0.85" y2="1">
        <stop offset="0" className="[stop-color:theme(colors.heat.1)]" />
        <stop offset="1" className="[stop-color:theme(colors.leaf)]" />
      </linearGradient>
      <linearGradient id="sprout-leaf-deep" x1="0.15" y1="0" x2="0.85" y2="1">
        <stop offset="0" className="[stop-color:theme(colors.leaf)]" />
        <stop offset="1" className="[stop-color:theme(colors.brand.500)]" />
      </linearGradient>
      <linearGradient id="sprout-brown" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0" className="[stop-color:theme(colors.heat.3)]" />
        <stop offset="1" className="[stop-color:theme(colors.heat.4)]" />
      </linearGradient>
      <linearGradient id="sprout-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" className="[stop-color:theme(colors.heat.2)]" />
        <stop offset="1" className="[stop-color:theme(colors.heat.3)]" />
      </linearGradient>
    </defs>
  )
}

// 흙 접시. 윗면과 옆면이 있고 오른쪽으로 그림자가 드리운다.
function Ground() {
  return (
    <g data-part="ground">
      <ellipse cx="64" cy="83" rx="22" ry="6" className="fill-ink-900/10" />
      <ellipse cx="48" cy="84" rx="30" ry="9" className="fill-heat-4" />
      <ellipse cx="48" cy="84" rx="30" ry="9" className="fill-ink-900/25" />
      <ellipse cx="48" cy="80" rx="30" ry="9" className="fill-heat-4" />
      <ellipse cx="42" cy="78" rx="18" ry="4" className="fill-white/15" />
    </g>
  )
}

function Stem({ top }: { top: number }) {
  return <rect data-part="stem" x="46.5" y={top} width="3" height={80 - top} rx="1.5" className="fill-brand-500" />
}

// 아직 싹트지 않은 씨앗. 흙에 반쯤 묻혀 있고, 나오지 않은 싹의 윤곽이 점선으로 남아 있다.
function Seed() {
  return (
    <g data-part="seed-stage">
      <g fill="none" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="1 4" className="stroke-leaf">
        <path data-part="ghost" d="M48 66V48" />
        <path d="M48 52C48 44 56 39 64 41C64 49 58 54 48 52Z" />
      </g>
      <g transform="rotate(-16 48 76)">
        <path data-part="seed" d="M48 67C54 69 56 77 48 85C40 77 42 69 48 67Z" fill="url(#sprout-brown)" />
        <ellipse cx="45.6" cy="73" rx="1.5" ry="3.6" className="fill-white/45" />
      </g>
      <ellipse cx="48" cy="82" rx="11" ry="3.4" className="fill-heat-4" />
    </g>
  )
}

function Sprout() {
  return (
    <g data-part="sprout-stage">
      <path d="M48 80C48 72 48 66 49.5 58" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-brand-500" />
      <path data-part="leaf" d="M49.5 60C49 49 57 43 67 45C67 55 60 61 49.5 60Z" fill="url(#sprout-leaf)" />
      <path data-part="leaf" d="M48.5 70C48 63 42 60 36 61.5C36.5 68 41 71 48.5 70Z" fill="url(#sprout-leaf-deep)" />
    </g>
  )
}

// 로고처럼 오른쪽은 연두, 왼쪽은 진초록인 두 장의 떡잎
function Cotyledons() {
  return (
    <g data-part="cotyledon-stage">
      <Stem top={56} />
      <path
        data-part="leaf"
        d="M48 58C48 46 58 40 71 43C71 55 61 62 48 58Z"
        fill="url(#sprout-leaf)"
      />
      <path
        data-part="leaf"
        d="M48 58C48 46 58 40 71 43C71 55 61 62 48 58Z"
        transform="translate(96 0) scale(-1 1)"
        fill="url(#sprout-leaf-deep)"
      />
    </g>
  )
}

function Leafy() {
  return (
    <g data-part="leafy-stage">
      <Stem top={40} />
      {LEAF_PAIRS.map(({ y, scale }) => (
        <g key={y}>
          <path
            data-part="leaf"
            d={LEAF_PATH}
            transform={`translate(48 ${y}) scale(${scale})`}
            fill="url(#sprout-leaf)"
          />
          <path
            data-part="leaf"
            d={LEAF_PATH}
            transform={`translate(48 ${y}) scale(${-scale} ${scale})`}
            fill="url(#sprout-leaf-deep)"
          />
        </g>
      ))}
      <ellipse data-part="bud" cx="48" cy="38" rx="4" ry="6.5" fill="url(#sprout-leaf)" />
    </g>
  )
}

// 줄기 위에 둥근 잎 덩어리를 쌓은 나무. 5단계에는 금빛 꽃이 핀다.
function Tree({ stage }: { stage: 4 | 5 }) {
  const tiers = TIERS[stage]
  return (
    <g data-part="tree-stage">
      <rect data-part="trunk" x="44.5" y="56" width="7" height="24" rx="3" fill="url(#sprout-brown)" />
      {tiers.map(({ cy, rx, ry }, index) => (
        <g key={cy} data-part="tier">
          <ellipse cx="48" cy={cy} rx={rx} ry={ry} fill={index === 0 ? 'url(#sprout-leaf-deep)' : 'url(#sprout-leaf)'} />
          <ellipse cx={48 + rx * 0.35} cy={cy + ry * 0.3} rx={rx * 0.6} ry={ry * 0.6} className="fill-ink-900/10" />
          <ellipse cx={48 - rx * 0.4} cy={cy - ry * 0.4} rx={rx * 0.35} ry={ry * 0.25} className="fill-white/25" />
        </g>
      ))}
      {stage === 5 &&
        BLOSSOMS.map(([x, y]) => (
          <g key={`${x}-${y}`} data-part="blossom">
            <circle cx={x} cy={y} r="3.6" fill="url(#sprout-gold)" />
            <circle cx={x} cy={y} r="1.4" className="fill-heat-4" />
          </g>
        ))}
    </g>
  )
}

// 가꾼다는 뜻의 소품. 왼쪽에 물뿌리개, 오른쪽에 삽을 둔다.
function Props() {
  return (
    <g data-part="props">
      <g data-part="watering-can">
        <path d="M26 82L34 75" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-heat-3" />
        <path d="M13 81C7 81 7 89 13 89" fill="none" strokeWidth="2.2" strokeLinecap="round" className="stroke-heat-3" />
        <rect x="12" y="78" width="15" height="12" rx="3.5" fill="url(#sprout-gold)" />
        <ellipse cx="19.5" cy="78.5" rx="7.5" ry="2" className="fill-heat-3" />
      </g>
      <g data-part="shovel">
        <path d="M84 68L75 84" fill="none" strokeWidth="2.6" strokeLinecap="round" className="stroke-ink-600" />
        <ellipse cx="74" cy="86" rx="4.2" ry="5.6" transform="rotate(30 74 86)" className="fill-ink-400" />
      </g>
    </g>
  )
}
