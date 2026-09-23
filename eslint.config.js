import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.min.js']
  },
  {
    files: ['src/**/*.{ts,js}', 'server.js', 'rtm.js', 'tests/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-console': 'off'
    }
  }
];
