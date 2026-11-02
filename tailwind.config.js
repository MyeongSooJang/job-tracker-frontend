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
        brand: {
          50: '#EEF6FF',
          100: '#D9EAFF',
          500: '#2F6FED',
          600: '#2559C7',
          700: '#1D459C',
        },
        success: '#12B886',
        warn: '#F59F00',
        danger: '#E03131',
        ink: {
          900: '#1A1D23',
          600: '#5B6270',
          400: '#9AA1AE',
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
        line: '#E5E8EE',
        surface: '#F6F7F9',
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
