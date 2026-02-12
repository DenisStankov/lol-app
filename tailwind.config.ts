import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main colors
        'bg-main': 'var(--color-bg-main)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-purple': 'var(--color-bg-purple)',
        'bg-card': 'var(--color-bg-card)',
        'bg-card-hover': 'var(--color-bg-card-hover)',

        // Text colors
        'text-main': 'var(--color-text-main)',
        'text-secondary': 'var(--color-text-secondary)',

        // Accent colors
        'accent': 'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
        'accent-dark': 'var(--color-accent-dark)',
        'accent-muted': 'var(--color-accent-muted)',

        // Status colors
        'win-bg': 'var(--color-win-bg)',
        'win-text': 'var(--color-win-text)',
        'loss-bg': 'var(--color-loss-bg)',
        'loss-text': 'var(--color-loss-text)',

        // UI colors
        'border': 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
      },
    },
  },
  plugins: [],
} satisfies Config;
