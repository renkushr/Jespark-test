/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#13ec13',
        'dark-green': '#0a5f0a',
        secondary: '#1a1a1a',
      }
    },
  },
  plugins: [],
}
