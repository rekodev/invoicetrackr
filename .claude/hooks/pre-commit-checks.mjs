#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const stampFile = path.join(root, '.claude', '.verify-stamp');
const manualRun = process.argv.includes('--run');

const SHARED = {
  'shared/types/': { build: 'types', consumers: ['server', 'client'] },
  'shared/emails/': { build: 'emails', consumers: ['server', 'client'] },
  'shared/pdf/': { build: 'pdf', consumers: ['server', 'client'] }
};
const GLOBAL_CONFIG = /^(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|tsconfig[^/]*\.json|eslint\.config\.[cm]?js)$/;
const LINTABLE = /\.(c|m)?(j|t)sx?$/;

const git = (args) =>
  spawnSync('git', args, { cwd: root, encoding: 'utf8' }).stdout ?? '';

const readCommand = () => {
  if (manualRun) return '';
  const payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
  return payload.tool_input?.command ?? '';
};

const command = readCommand();
if (!manualRun && !/\bgit\b[^|;&]*\bcommit\b/.test(command)) process.exit(0);
if (/--dry-run|\s-h\b|--help/.test(command)) process.exit(0);

const includesWorkingTree = /\s(-[a-zA-Z]*a[a-zA-Z]*|--all)\b/.test(command);
const changedFiles = [
  ...new Set([
    ...git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']).split('\n'),
    ...(includesWorkingTree
      ? git(['diff', '--name-only', '--diff-filter=ACMR']).split('\n')
      : [])
  ])
].filter(Boolean);

if (changedFiles.length === 0) process.exit(0);

const fingerprint = createHash('sha256')
  .update(
    changedFiles
      .map((file) => {
        const absolute = path.join(root, file);
        return `${file}:${existsSync(absolute) ? createHash('sha256').update(readFileSync(absolute)).digest('hex') : 'missing'}`;
      })
      .join('\n')
  )
  .digest('hex');

if (!manualRun && existsSync(stampFile) && readFileSync(stampFile, 'utf8').trim() === fingerprint)
  process.exit(0);

const builds = new Set();
const typecheck = new Set();
const lint = { client: [], server: [] };

for (const file of changedFiles) {
  if (GLOBAL_CONFIG.test(file)) {
    Object.values(SHARED).forEach((pkg) => builds.add(pkg.build));
    typecheck.add('server').add('client');
    continue;
  }
  const shared = Object.entries(SHARED).find(([prefix]) => file.startsWith(prefix));
  if (shared) {
    builds.add(shared[1].build);
    shared[1].consumers.forEach((consumer) => typecheck.add(consumer));
    continue;
  }
  for (const pkg of ['client', 'server']) {
    if (!file.startsWith(`${pkg}/`)) continue;
    typecheck.add(pkg);
    if (LINTABLE.test(file) && existsSync(path.join(root, file)))
      lint[pkg].push(file.slice(pkg.length + 1));
  }
}

const steps = [
  ...['types', 'emails', 'pdf']
    .filter((pkg) => builds.has(pkg))
    .map((pkg) => ({ label: `build ${pkg}`, cwd: root, args: ['run', pkg, 'build'] })),
  ...['server', 'client']
    .filter((pkg) => typecheck.has(pkg))
    .map((pkg) => ({ label: `typecheck ${pkg}`, cwd: path.join(root, pkg), args: ['run', 'tsc'] })),
  ...['server', 'client']
    .filter((pkg) => lint[pkg].length)
    .map((pkg) => ({
      label: `lint ${pkg} (${lint[pkg].length} files)`,
      cwd: path.join(root, pkg),
      args: ['exec', 'eslint', '--no-warn-ignored', ...lint[pkg]]
    }))
];

for (const step of steps) {
  const run = spawnSync('pnpm', step.args, { cwd: step.cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (run.status === 0) continue;
  const output = `${run.stdout ?? ''}${run.stderr ?? ''}`
    .split('\n')
    .filter((line) => line.trim() && !/MODULE_TYPELESS_PACKAGE_JSON|Reparsing as ES module|add "type": "module"|trace-warnings/.test(line))
    .slice(-80)
    .join('\n');
  process.stderr.write(
    [
      `Commit blocked: ${step.label} failed.`,
      `Checked: ${steps.map((item) => item.label).join(', ')}.`,
      'Find the cause in the output below, fix it, re-stage the files, and retry the same commit. Do not bypass this check.',
      '',
      output
    ].join('\n') + '\n'
  );
  process.exit(2);
}

writeFileSync(stampFile, `${fingerprint}\n`);
if (manualRun) process.stdout.write(`Checks passed: ${steps.map((item) => item.label).join(', ') || 'nothing to check'}\n`);
process.exit(0);
