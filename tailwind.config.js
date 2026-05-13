/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          background: '#020202', // Deep cinematic black
          card: '#0A0A0A',
          cardSecondary: '#111111',
          primary: '#FFFFFF',
          accent: '#EC4899', // Cyber Pink
          highlight: '#8B5CF6', // AI Purple
          textPrimary: '#F8FAFC',
          textSecondary: '#64748B',
          textDark: '#020617',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          border: 'rgba(255, 255, 255, 0.05)',
        },
        ai: {
          glow: 'rgba(139, 92, 246, 0.3)',
          pink: 'rgba(236, 72, 153, 0.3)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '20px',
        '3xl': '32px',
      },
      boxShadow: {
        'premium': '0 0 50px -12px rgba(0, 0, 0, 0.5)',
        'ai-glow': '0 0 20px -5px rgba(139, 92, 246, 0.5)',
        'pink-glow': '0 0 20px -5px rgba(236, 72, 153, 0.5)',
      }
    },
  },
  plugins: [],
}
