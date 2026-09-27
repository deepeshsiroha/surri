/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          50: '#edfcf2',
          100: '#d3f8e0',
          500: '#1b7a42',
          600: '#136034',
          700: '#0f4c29',
          800: '#0e3d22',
          900: '#0c331d',
          950: '#041d0e',
        },
        wood: {
          700: '#5a2d0c',
          800: '#3e1e07',
          900: '#271203',
        },
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        }
      },
      boxShadow: {
        'table-inner': 'inset 0 0 50px rgba(0, 0, 0, 0.6)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 12px 20px -2px rgba(0, 0, 0, 0.35), 0 4px 8px -2px rgba(0, 0, 0, 0.25)',
        'card-glow': '0 0 15px 3px rgba(250, 204, 21, 0.7)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounceShort 0.5s ease-in-out 1',
        'deal-card': 'dealCard 0.4s ease-out forwards',
      },
      keyframes: {
        bounceShort: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        dealCard: {
          '0%': { opacity: '0', transform: 'scale(0.6) translateY(-40px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
