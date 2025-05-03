import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-scheme="dark"]'],
  theme: {
    // TODO: 确认是否需要 container
    // container: {
    //   center: true,
    //   padding: {
    //     DEFAULT: '0.5rem',
    //     sm: '0.5rem',
    //     md: '1rem',
    //     lg: '2rem',
    //     xl: '4rem',
    //   },
    //   // screens: {
    //   //   '2xl': '1400px',
    //   // },
    // },
    extend: {
      colors: {
        jade: {
          50: '#f6f9fd',
          100: '#e8edf3',
          200: '#d9e0e8',
          300: '#c9d1d9',
          400: '#b8c0c8',
          500: '#808890',
          600: '#596169',
          700: '#34393e',
          800: '#24292e',
          900: '#1a1e22',
          950: '#101216',
        },
      },
      boxShadow: {
        card: '0 2px 4px rgba(0,0,0,0.25)',
      },
      textShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.5)',
        DEFAULT: '0 2px 4px rgba(0,0,0,0.5)',
        lg: '0 3px 8px rgba(0,0,0,0.5)',
      },
      transitionProperty: {
        'background-color': 'background-color',
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
