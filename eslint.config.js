import antfu from '@antfu/eslint-config';

export default antfu(
  {
    astro: true,
    stylistic: {
      semi: true,
      overrides: {
        'style/arrow-parens': ['error', 'always'],
      },
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      'no-await-in-loop': 'off',
      'antfu/no-top-level-await': 'off',
    },
  },
);
