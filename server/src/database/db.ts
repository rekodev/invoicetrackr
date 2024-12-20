import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import postgres from 'postgres';

config({ path: '.env' });

const sqlNeon = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sqlNeon });

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// TODO: remove after Drizzle migration is finalized
export const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
});

export async function getPgVersion() {
  const result = await sql`select version()`;
  console.log(result[0]);
}
