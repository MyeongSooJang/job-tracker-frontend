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
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
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
        success: '#12B886',
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
          'striver-bg': '#E6FCF5',
          'striver-fg': '#087F5B',
          'diligent-bg': '#FFF4E6',
          'diligent-fg': '#D9480F',
          'dreamer-bg': '#F3F0FF',
          'dreamer-fg': '#5F3DC4',
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
