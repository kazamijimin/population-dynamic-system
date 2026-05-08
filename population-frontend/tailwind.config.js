/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f8fafc',
          muted: '#f1f5f9',
          lavender: '#faf5ff',
        },
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        'card': '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 16px -4px rgba(15, 23, 42, 0.06)',
        'lift': '0 8px 24px -8px rgba(124, 58, 237, 0.18)',
        'brand': '0 10px 25px -10px rgba(124, 58, 237, 0.5)',
      },
      borderRadius: {
        'xl2': '1.25rem',
      },
    },
  },
  plugins: [],
}
