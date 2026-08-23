import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));
const composeArgs = [
  'compose',
  '--project-name',
  'invoicetrackr-e2e',
  '--file',
  'e2e/docker-compose.yml'
];
const environment = {
  ...process.env,
  APP_BASE_URL: 'http://127.0.0.1:3100',
  AUTH_SECRET: 'invoicetrackr-e2e-auth-secret-32-chars',
  AUTH_URL: 'http://127.0.0.1:3100',
  DATABASE_DRIVER: 'pg',
  DATABASE_URL:
    'postgresql://invoicetrackr:invoicetrackr@127.0.0.1:55432/invoicetrackr_e2e',
  E2E_BASE_URL: 'http://127.0.0.1:3100',
  NEXT_PUBLIC_BASE_URL: 'http://127.0.0.1:3100',
  NODE_ENV: 'development',
  RESEND_EMAIL_API_KEY: 're_e2e_placeholder',
  SERVER_PORT: '5100'
};

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: workspaceRoot,
    env: environment,
    stdio: 'inherit',
    ...options
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed`);
  }
};

try {
  run('docker', [...composeArgs, 'up', '--detach', '--wait']);
  run('pnpm', ['run', 'types', 'build']);
  run('pnpm', ['run', 'emails', 'build']);
  run('pnpm', ['run', 'e2e:db:prepare']);
  run('pnpm', ['exec', 'playwright', 'install', 'chromium']);
  run('pnpm', ['exec', 'playwright', 'test', ...process.argv.slice(2)]);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  spawnSync('docker', [...composeArgs, 'down', '--volumes'], {
    cwd: workspaceRoot,
    env: environment,
    stdio: 'inherit'
  });
}
