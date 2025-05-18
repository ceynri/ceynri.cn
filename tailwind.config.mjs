import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-scheme="dark"]'],
  theme: {
    extend: {
      colors: {
        jade: {
          50: 'var(--jade-50)',
          100: 'var(--jade-100)',
          200: 'var(--jade-200)',
          300: 'var(--jade-300)',
          400: 'var(--jade-400)',
          500: 'var(--jade-500)',
          600: 'var(--jade-600)',
          700: 'var(--jade-700)',
          800: 'var(--jade-800)',
          900: 'var(--jade-900)',
          950: 'var(--jade-950)',
        },
        accent: 'var(--accent-color)',
      },
      spacing: {
        'prose': 'var(--prose-padding)',
        'prose-half': 'calc(var(--prose-padding) / 2)',
      },
      textShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
        DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.5)',
        lg: '0 3px 8px rgba(0, 0, 0, 0.5)',
      },
      transitionDuration: {
        fast: '0.1s',
        DEFAULT: '0.3s',
        slow: '0.5s',
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') },
      );
    }),
  ],
};
