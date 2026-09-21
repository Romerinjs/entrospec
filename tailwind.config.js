/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#0A0A0A',
        'surface-elevated': '#141414',
        'surface-interactive': '#1F1F1F',
        'surface-hover': '#282828',
        'surface-accent': '#333333',
        'text-primary': '#F3F3F3',
        'text-secondary': '#A1A1A1',
        'text-tertiary': '#737373',
        'accent-phosphor': '#22C55E',
        'accent-cobalt': '#3B82F6',
        'accent-terracotta': '#E06D53',
      },
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '0.125rem', // 2px
        md: '0.25rem',  // 4px
        lg: '0.5rem',   // 8px
        full: '9999px',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0em',
        wide: '0.02em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
  },
  plugins: [],
}
