/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        card: '#111726',
        border: '#1e293b',
        primary: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
        },
        cyanGlow: '#06b6d4',
      }
    },
  },
  plugins: [],
}
