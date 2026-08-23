import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('E2E database preparation requires DATABASE_URL');
}

const parsedDatabaseUrl = new URL(databaseUrl);
const databaseName = decodeURIComponent(parsedDatabaseUrl.pathname.slice(1));
const isExpectedDatabase =
  process.env.DATABASE_DRIVER === 'pg' &&
  parsedDatabaseUrl.protocol === 'postgresql:' &&
  ['127.0.0.1', 'localhost'].includes(parsedDatabaseUrl.hostname) &&
  ['5432', '55432'].includes(parsedDatabaseUrl.port) &&
  parsedDatabaseUrl.username === 'invoicetrackr' &&
  databaseName === 'invoicetrackr_e2e';

if (!isExpectedDatabase) {
  throw new Error(
    'Refusing to prepare a database outside the disposable InvoiceTrackr E2E PostgreSQL instance'
  );
}

const result = spawnSync(
  'pnpm',
  [
    '--filter',
    '@invoicetrackr/server',
    'exec',
    'drizzle-kit',
    'push'
  ],
  {
    cwd: workspaceRoot,
    env: process.env,
    stdio: 'inherit'
  }
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
