/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        // LarkPilot brand red, sampled from larkaihealth.com
        // (#ED2024 primary, #F68C8E salmon, #7D1113/#3B0809/#300607 deep reds).
        brand: {
          50: '#fdf3f3',
          100: '#fbe2e3',
          200: '#f7c6c7',
          300: '#f68c8e',
          400: '#f15558',
          500: '#ed2024',
          600: '#d4121a',
          700: '#7d1113',
          800: '#3b0809',
          900: '#300607'
        }
      },
      boxShadow: {
        glass: '0 10px 40px -12px rgba(237, 32, 36, 0.25)',
        'glass-lg': '0 24px 60px -20px rgba(237, 32, 36, 0.35)',
        soft: '0 2px 12px -4px rgba(15, 23, 42, 0.12)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #ed2024 0%, #cb003f 55%, #7d1113 100%)',
        'app-gradient':
          'radial-gradient(900px 520px at 50% 118%, rgba(125,17,19,0.5) 0%, transparent 60%), radial-gradient(1100px 700px at 50% -12%, rgba(59,8,9,0.55) 0%, transparent 55%), linear-gradient(180deg, #0a0506 0%, #060304 100%)'
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
