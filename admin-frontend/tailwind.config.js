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
        background: '#090B0E',
        surface: '#11141C',
        card: '#161A24',
        border: '#232838',
        primary: {
          DEFAULT: '#00E676',
          50: '#E8F5E9',
          100: '#C8E6C9',
          400: '#66BB6A',
          500: '#00E676',
          600: '#00C853',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
