/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#b8ceff',
          300: '#8aacff',
          400: '#5c85ff',
          500: '#3762f7',
          600: '#2748db',
          700: '#2038af',
          800: '#1e318a',
          900: '#1c2c6f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16,24,40,0.04)',
        panel: '0 8px 30px -8px rgba(16, 24, 40, 0.18)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in .25s ease-out',
      },
    },
  },
  plugins: [],
}
