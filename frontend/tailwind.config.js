/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      },
      boxShadow: {
        glass: '0 10px 40px -12px rgba(79, 70, 229, 0.25)',
        'glass-lg': '0 24px 60px -20px rgba(79, 70, 229, 0.35)',
        soft: '0 2px 12px -4px rgba(15, 23, 42, 0.12)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
        'app-gradient':
          'radial-gradient(1200px 600px at 10% -10%, #e0e7ff 0%, transparent 55%), radial-gradient(1000px 600px at 110% 10%, #f3e8ff 0%, transparent 50%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'fade-in-fast': 'fade-in-fast 0.3s ease-out both',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
        'spin-slow': 'spin-slow 1.2s linear infinite'
      }
    }
  },
  plugins: []
};
