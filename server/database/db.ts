import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

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
