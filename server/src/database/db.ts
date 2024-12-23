import { neonConfig, Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

config({ path: '.env' });
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool });

export const getPgVersion = async () => {
  const result = await db.execute('SELECT version()');
  console.log(result.rows[0]);
};
