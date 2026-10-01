import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // _revamp/ and .wrangler/ are local-only workshop and tool output, never shipped
  globalIgnores(['dist', '_revamp', '.wrangler']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Cloudflare Pages Functions: an empty catch is a deliberate "best effort" there
    files: ['functions/**/*.js'],
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // Node contract tests (node --test)
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
