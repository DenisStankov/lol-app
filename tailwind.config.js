/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'lol-gold': {
          DEFAULT: '#C89B3C',
          'light': '#F0E6D2',
          'dark': '#785A28',
        },
        'lol-blue': {
          DEFAULT: '#0A1428',
          'light': '#CDFAFA',
          'dark': '#091428',
        },
        'lol-grey': {
          DEFAULT: '#A09B8C',
          'dark': '#5B5A56',
        },
        'lol-border': '#1E2328',
        'lol-overlay': 'rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'stat-bar-fill': 'stat-bar-fill 1s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'stat-bar-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--stat-bar-width)' },
        },
      },
    },
  },
  plugins: [],
}
