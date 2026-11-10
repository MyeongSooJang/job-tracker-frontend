/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont',
          'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo',
          'Noto Sans KR', 'Malgun Gothic', 'sans-serif',
        ],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        // 소개 페이지: 단계가 바뀔 때 새 식물이 흙에서 올라오듯 나타난다
        grow: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.94)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        // 새싹 그림: 식물이 바람에 살랑이고, 씨앗 단계의 싹 윤곽이 숨 쉬듯 변한다
        sway: 'sway 5s ease-in-out infinite',
        breathe: 'breathe 3.4s ease-in-out infinite',
        grow: 'grow 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      colors: {
        // 마이페이지/인증 화면용 브랜드 토큰. 색상은 여기 한 곳에서만 바꾼다.
        // 기준은 로고의 진초록(500). 나머지 단계는 같은 색의 밝기만 바꾼 것이고, 950은 로고 어두운 배경색이다.
        brand: {
          50: '#EDF3F1',
          100: '#D6E4DF',
          500: '#1E6B4C',
          600: '#1A5B41',
          700: '#144934',
          950: '#12201A',
        },
        // 성공 표시는 브랜드 초록과 헷갈리지 않게 청록을 쓴다
        success: {
          DEFAULT: '#0B7A7F',
          soft: '#E2F3F3',
          strong: '#0B6A6E',
        },
        warn: '#F59F00',
        danger: '#E03131',
        // 글자색은 로고 먹색(900)에서 초록 기운을 유지한 회색 단계
        ink: {
          900: '#17261F',
          600: '#53625A',
          400: '#7E8A83',
        },
        // 취업 준비 기간 등급 배지 색 (bg: 배경, fg: 글자)
        grade: {
          'rookie-bg': '#F1F3F5',
          'rookie-fg': '#495057',
          'challenger-bg': '#E7F5FF',
          'challenger-fg': '#1864AB',
          'striver-bg': '#E2F3F3',
          'striver-fg': '#0B6A6E',
          'diligent-bg': '#FFF4E6',
          'diligent-fg': '#D9480F',
          'dreamer-bg': '#F3F0FF',
          'dreamer-fg': '#5F3DC4',
        },
        // 로고의 연두. 새싹 그림의 잎 색
        leaf: '#6B9A1F',
        // 학습 잔디 농도. 크림에서 연두, 황금빛, 호박색으로 어두워진다 (GitHub 잔디의 초록과 구분하려고 따뜻한 색을 쓴다)
        heat: {
          1: '#C9E27A',
          2: '#E3B93C',
          3: '#D98A1F',
          4: '#A9560F',
        },
        line: '#E2E5DD',
        surface: '#F6F4EC', // 로고 크림색
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
