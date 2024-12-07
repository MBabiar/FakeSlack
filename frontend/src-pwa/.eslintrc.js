const { resolve } = require('path');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  overrides: [
    {
      files: ['custom-service-worker.ts'],
      env: {
        serviceworker: true,
      },
      parserOptions: {
        project: null // Disable TypeScript parsing for service worker
      }
    },
    {
      files: ['.eslintrc.js'],
      parser: 'espree', // Use regular ESLint parser for config file
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020
      }
    }
  ],
};