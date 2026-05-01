/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        pear: {
          DEFAULT: '#1db954',
          hover: '#16a14a',
          light: '#22c55e',
        },
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.6s ease-in',
        slideIn: 'slideIn 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out 1s infinite',
        marquee: 'marquee 30s linear infinite',
        'marquee-slow': 'marquee 45s linear infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      animationDelay: {
        75: '75ms',
        150: '150ms',
        200: '200ms',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.delay-75': { 'animation-delay': '75ms' },
        '.delay-150': { 'animation-delay': '150ms' },
        '.delay-200': { 'animation-delay': '200ms' },
        '.animation-paused': { 'animation-play-state': 'paused' },
        '.animation-running': { 'animation-play-state': 'running' },
      })
    }
  ],
} 