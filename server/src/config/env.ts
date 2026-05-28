import { dirname, join, resolve } from 'path';
import { config } from 'dotenv';
import { existsSync } from 'fs';

type LoadEnvOptions = {
  nodeEnv?: string;
};

let isLoaded = false;

const findWorkspaceRoot = () => {
  let currentDirectory = resolve(process.cwd());

  while (currentDirectory !== dirname(currentDirectory)) {
    if (existsSync(join(currentDirectory, 'pnpm-workspace.yaml'))) {
      return currentDirectory;
    }

    currentDirectory = dirname(currentDirectory);
  }

  return resolve(process.cwd());
};

export const loadEnv = (options: LoadEnvOptions = {}) => {
  if (isLoaded) return;

  const workspaceRoot = findWorkspaceRoot();
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV;

  if (nodeEnv === 'production') {
    config({ path: join(workspaceRoot, '.env') });
    isLoaded = true;
    return;
  }

  config({ path: join(workspaceRoot, '.env.local') });
  config({ path: join(workspaceRoot, '.env') });

  isLoaded = true;
};
