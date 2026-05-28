import { defineConfig } from 'drizzle-kit';

import { loadEnv } from './src/config/env';

loadEnv();

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
