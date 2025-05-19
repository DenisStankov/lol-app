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
        'bg-purple': 'var(--color-bg-purple)',
        'bg-card': 'var(--color-bg-card)',
        'bg-card-hover': 'var(--color-bg-card-hover)',
        
        // Text colors
        'text-main': 'var(--color-text-main)',
        'text-secondary': 'var(--color-text-secondary)',
        
        // Accent colors
        'badge-blue': 'var(--color-badge-blue)',
        'icon-blue': 'var(--color-icon-blue)',
        'gradient-purple': 'var(--color-gradient-purple)',
        'gradient-blue': 'var(--color-gradient-blue)',
        
        // Status colors
        'win-bg': 'var(--color-win-bg)',
        'win-text': 'var(--color-win-text)',
        'loss-bg': 'var(--color-loss-bg)',
        'loss-text': 'var(--color-loss-text)',
        
        // UI colors
        'footer-bg': 'var(--color-footer-bg)',
        'border': 'var(--color-border)',
      },
      backgroundImage: {
        'gradient-tracker': 'linear-gradient(to bottom right, var(--color-bg-main), var(--color-bg-purple), var(--color-bg-main))',
        'gradient-accent': 'linear-gradient(to right, var(--color-gradient-purple), var(--color-gradient-blue))',
      },
    },
  },
  plugins: [],
} satisfies Config;
