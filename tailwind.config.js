/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          dark: 'var(--color-bg)',
          purple: 'var(--color-primary)',
          lightPurple: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
          card: 'var(--color-surface)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'premium-gradient': 'var(--gradient-main)',
        'card-gradient': 'var(--gradient-card)',
      }
    },
  },
  plugins: [],
}
