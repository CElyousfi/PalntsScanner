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
        'apeel-cream': '#FAF3E6',
        'apeel-green': '#2F4E37',    // Deep forest green
        'apeel-light': '#F2E8D5',     // Slightly darker cream for cards
        'apeel-black': '#1A1A1A',     // Softer black for text
        'apeel-accent': '#6BBF59',    // Fresh green accent
      },
      fontFamily: {
        sans: ['var(--font-urbanist)', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '2rem',
        '4xl': '3rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'reveal': 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        reveal: {
          '0%': { clipPath: 'inset(0 0 100% 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
      },
    },
  },
  plugins: [],
}
