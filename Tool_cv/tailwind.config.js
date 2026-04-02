/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Zalo Mini App theme
        "primary": "#0068FF",
        "secondary": "#005AEB",
        "dark-bg": "#070A15",
        "accent-cyan": "#00A5FF",
        "surface-dark": "#111827",
        "background-light": "#f4f5f7",
        "background-dark": "#111621",
        "surface-light": "#ffffff",
        "border-light": "#EAEBEE",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px",
      },
    },
  },
  plugins: [],
}
