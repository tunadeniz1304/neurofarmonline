/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        nf: {
          primary: '#1A5C38',
          secondary: '#2E7D52',
          accent: '#4CAF50',
          lime: '#A8E06C',
          dark: '#0D1B12',
          neutral: '#F4F7F5',
          gold: '#D4A843',
          text: '#1A1A2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
