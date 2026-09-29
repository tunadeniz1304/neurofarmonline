/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        nf: {
          ink: '#060D09',
          deep: '#0A1510',
          surface: '#0F1E16',
          raised: '#152A1F',
          line: '#1E3328',
          text: '#E8F1EA',
          muted: '#93A89A',
          dim: '#6B7F72',
          signal: '#C4F36B',
          leaf: '#3FD18A',
          amber: '#F4B942',
          coral: '#FF7A59',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      maxWidth: {
        page: '76rem',
      },
    },
  },
  plugins: [],
};
