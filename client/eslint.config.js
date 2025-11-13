import { defineConfig } from 'eslint/config';
import eslintNextPlugin from '@next/eslint-plugin-next';
import nextVitals from 'eslint-config-next/core-web-vitals';
import baseConfig from '../eslint.config.js';

const eslintConfig = defineConfig([
  ...baseConfig,
  ...nextVitals,
  {
    plugins: {
      next: eslintNextPlugin
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off'
    }
  }
]);

export default eslintConfig;
