import { neonConfig, Pool as NeonPool } from '@neondatabase/serverless';
import {
  drizzle as drizzleNeon,
  type NeonDatabase
} from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';
import ws from 'ws';

import { loadEnv } from '../config/env';
import * as schema from './schema';

loadEnv();
const createDatabase = () => {
  if (process.env.DATABASE_DRIVER === 'pg') {
    const pool = new PgPool({ connectionString: process.env.DATABASE_URL });

    return drizzlePg({ client: pool, schema }) as unknown as NeonDatabase<
      typeof schema
    >;
  }

  neonConfig.webSocketConstructor = ws;
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });

  return drizzleNeon({ client: pool, schema });
};

export const db = createDatabase();

export const getPgVersion = async () => {
  const result = await db.execute('SELECT version()');
  console.log(result.rows[0]);
};
