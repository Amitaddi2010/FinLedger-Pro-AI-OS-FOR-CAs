export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finledger: {
          slate: '#0f172a',    // Premium dark blue slate
          charcoal: '#1e293b', // Card backgrounds
          silver: '#94a3b8',   // Light muted text
          emerald: '#10b981',  // Profit/success
          ruby: '#ef4444',     // Losses/risks
          indigo: '#6366f1',   // Primary actions (adjusted for softer premium feel)
          gold: '#f59e0b',     // Warnings / Mid-levels
          electric: '#8b5cf6', // Secondary gradients
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'text-shine': 'text-shine 2s linear infinite',
        'scan': 'scan 4s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'text-shine': {
          'from': { backgroundPosition: '100% 0' },
          'to': { backgroundPosition: '-100% 0' },
        },
        scan: {
          'from': { transform: 'translateY(-100%)' },
          'to': { transform: 'translateY(100%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.98)' },
        }
      }
    },
  },
  plugins: [],
}
