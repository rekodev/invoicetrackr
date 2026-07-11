import { neonConfig,Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import { loadEnv } from '../config/env';
import * as schema from './schema';

loadEnv();
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

export const getPgVersion = async () => {
  const result = await db.execute('SELECT version()');
  console.log(result.rows[0]);
};
