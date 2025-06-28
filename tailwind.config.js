/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'xefag-green': '#98BF64',
        'xefag-dark': '#7A9B4F',
        'xefag-red': '#FF6B6B',
        'xefag-dark-red': '#E04F4F',
        'xefag-gold': '#FFD700',
        'xefag-dark-gold': '#DAA520',
      },
      backgroundImage: {
        'xefag-gradient': 'linear-gradient(135deg, #98BF64 0%, #7A9B4F 100%)',
        'xefag-red-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #E04F4F 100%)',
        'xefag-gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
      }
    },
  },
  plugins: [],
}