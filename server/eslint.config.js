import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

import baseConfig from '../eslint.config.js';

const eslintConfig = defineConfig([
  ...baseConfig,
  {
    ignores: ['vitest.config.ts', 'drizzle.config.ts'],
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      },
      globals: {
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off'
    }
  },
  {
    files: ['vitest.config.ts'],
    languageOptions: {
      parser: tsParser,
      globals: {
        __dirname: 'readonly'
      }
    }
  }
]);

export default eslintConfig;
