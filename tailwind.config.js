/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#122056',
          50: '#EEF0FB',
          100: '#D5D9F4',
          200: '#ABB2E9',
          300: '#808CDE',
          400: '#5B65DC',
          500: '#5B65DC',
          600: '#4A52C4',
          700: '#3A40A0',
          800: '#2A2F78',
          900: '#1A205C',
          950: '#122056',
        },
        accent: {
          DEFAULT: '#5B65DC',
          light: '#EEEFFD',
        },
        bg: {
          DEFAULT: '#FAFAFD',
          white: '#FFFFFF',
        },
        triage: {
          red: '#DC2626',
          'red-light': '#FEE2E2',
          orange: '#EA580C',
          'orange-light': '#FFEDD5',
          yellow: '#CA8A04',
          'yellow-light': '#FEF3C7',
          'light-green': '#16A34A',
          'light-green-light': '#DCFCE7',
          green: '#15803D',
          'green-light': '#D1FAE5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(18, 32, 86, 0.06), 0 1px 2px 0 rgba(18, 32, 86, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(18, 32, 86, 0.08), 0 2px 4px 0 rgba(18, 32, 86, 0.04)',
        elevated: '0 10px 30px 0 rgba(18, 32, 86, 0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
