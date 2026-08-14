import type { Config } from 'tailwindcss'

/**
 * Connex design tokens.
 *
 * Palette values are read from the product mockup (see docs/MOCKUP-FINDINGS.md §3).
 * They are placeholders until real brand hex codes are supplied — change them here
 * and the whole UI follows.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: {
          900: '#5A0B2E', // panel header, dark end of gradient
          800: '#7A1246', // panel header, light end
          700: '#8E1552',
        },
        magenta: {
          700: '#8C1453',
          600: '#A0185F', // primary buttons, send button
          500: '#B92A73',
        },
        navy: {
          900: '#161F44',
          800: '#1F2A5A', // assistant avatar badge
        },
        success: {
          700: '#25834B',
          600: '#2E9E5B', // reschedule buttons
          50: '#EAF7EF',
        },
        danger: {
          700: '#A81F1F',
          600: '#C62828', // flagged values, warning icons
          50: '#FDECEF', // alert banner background
        },
        warning: {
          600: '#D06A1F',
          500: '#E8792B', // amber accents on portal cards
          50: '#FDF2E9',
        },
        online: '#3DDC84', // status dot next to "Your AI Assistant"
        ink: {
          900: '#111827',
          700: '#374151',
          500: '#6B7280',
          400: '#9CA3AF',
        },
        panel: '#F5F6F8', // panel body behind cards
        hairline: '#E5E7EB',
      },
      borderRadius: {
        card: '10px',
        panel: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.10)',
        panel: '-8px 0 24px rgba(16, 24, 40, 0.12)',
        launcher: '0 4px 14px rgba(90, 11, 46, 0.35)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { opacity: '0.25', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-3px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 260ms ease-out both',
        'slide-in-right': 'slide-in-right 240ms ease-out both',
        'typing-dot': 'typing-dot 1.2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}

export default config
