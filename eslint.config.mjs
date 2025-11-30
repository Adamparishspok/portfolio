import js from '@eslint/js';
import globals from 'globals';
import html from 'eslint-plugin-html';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['_site/', 'node_modules/', 'dist/', 'src/assets/js/'],
  },
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.js'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.html', '**/*.njk', '**/*.webc'],
    plugins: {
      html,
      prettier: prettierPlugin,
    },
    settings: {
      'html/html-extensions': ['.html', '.njk', '.webc'],
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        posthog: 'readonly',
        lucide: 'readonly',
        UnicornStudio: 'readonly',
        Motion: 'readonly',
      },
    },
    rules: {
      'prettier/prettier': 'off',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
];
