import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'saas-primary': 'var(--saas-primary)',
        'saas-accent': 'var(--saas-accent)',
        'saas-light': 'var(--saas-light)',
        'saas-border': 'var(--saas-border)',
        'saas-text': 'var(--saas-text)',
        'saas-muted': 'var(--saas-muted)',
        'saas-success': 'var(--saas-success)',
        'saas-danger': 'var(--saas-danger)',
        'saas-warning': 'var(--saas-warning)',
      },
      fontFamily: {
        sans: ["'Segoe UI'", 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      backgroundImage: {
        'saas-gradient': 'linear-gradient(135deg, var(--saas-primary), var(--saas-accent))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
