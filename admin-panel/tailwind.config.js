/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Noto Sans Thai', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#003399',
          50: '#e6edff',
          100: '#ccdaff',
          200: '#99b5ff',
          300: '#6690ff',
          400: '#336bff',
          500: '#003399',
          600: '#002d87',
          700: '#002266',
          800: '#001a4d',
          900: '#001433',
        },
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
        slideOutRight: 'slideOutRight 0.3s ease-in',
      },
    },
  },
  plugins: [],
}
