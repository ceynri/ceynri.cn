import antfu from '@antfu/eslint-config';

export default antfu(
  {
    stylistic: {
      semi: true,
      overrides: {
        'style/arrow-parens': ['error', 'always'],
        'style/jsx-first-prop-new-line': ['error', 'multiprop'],
        'style/jsx-closing-bracket-location': ['error', 'line-aligned'],
        'perfectionist/sort-imports': ['error', {}],
        'curly': ['error', 'all'],
        'ts/member-ordering': 'error',
      },
    },
    astro: {
      overrides: {
        'style/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
        'style/indent': ['error', 2],
      },
    },
  },
);
