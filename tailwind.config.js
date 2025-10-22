/** @type {import('tailwindcss').Config} */
export default {
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
        }
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
        }
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.6s ease-in',
        slideIn: 'slideIn 0.3s ease-out',
      },
      animationDelay: {
        75: '75ms',
        150: '150ms',
        200: '200ms',
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.delay-75': { 'animation-delay': '75ms' },
        '.delay-150': { 'animation-delay': '150ms' },
        '.delay-200': { 'animation-delay': '200ms' },
      })
    }
  ],
} 