/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0E1015',
        surface: '#161922',
        'surface-hover': '#1E2330',
        card: '#1A1D28',
        border: '#262B3B',
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#00E676',
          600: '#00C853',
          700: '#00A152',
          800: '#007E33',
          900: '#004D40',
          DEFAULT: '#00E676',
        },
        accent: {
          green: '#00FF87',
          iq: '#00E676',
          lime: '#76FF03',
          gold: '#FFD700',
          vip: '#FFB800',
        },
      },
      boxShadow: {
        'green-glow': '0 0 20px rgba(0, 230, 118, 0.35)',
        'neon-glow': '0 0 35px rgba(0, 255, 135, 0.45)',
        'iq-card': '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 230, 118, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
