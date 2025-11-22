import js from '@eslint/js';
import globals from 'globals';
import html from 'eslint-plugin-html';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

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
      },
    },
    rules: {
      'prettier/prettier': 'off',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
];
