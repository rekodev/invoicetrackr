#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';

const CODE_FILE = /\.(c|m)?(j|t)sx?$/;
const ALLOWED = [
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bREK-\d+\b/i,
  /eslint-(disable|enable)/,
  /@ts-(expect-error|ignore|nocheck)/,
  /prettier-ignore/,
  /istanbul ignore/,
  /c8 ignore/,
  /@vitest-environment/,
  /#__PURE__/,
  /^\/\/\/ <reference/,
  /^#!/
];

const commentsIn = (lines) => {
  let inBlock = false;
  return lines.flatMap((line) => {
    const trimmed = line.trim();
    if (inBlock) {
      if (trimmed.includes('*/')) inBlock = false;
      return trimmed === '*/' ? [] : [trimmed];
    }
    if (/^(\/\*|\{\s*\/\*)/.test(trimmed)) {
      inBlock = !trimmed.includes('*/');
      return [trimmed];
    }
    if (trimmed.startsWith('//')) return [trimmed];
    const trailing = line.match(/[^:'"`]\s+(\/\/\s.*)$/);
    return trailing ? [trailing[1]] : [];
  });
};

const addedLines = ({ tool_name: tool, tool_input: input }) => {
  const minus = (next, previous) => {
    const before = new Set(previous.split('\n').map((line) => line.trim()));
    return next.split('\n').filter((line) => !before.has(line.trim()));
  };
  if (tool === 'Write') {
    const previous = existsSync(input.file_path) ? readFileSync(input.file_path, 'utf8') : '';
    return minus(input.content ?? '', previous);
  }
  if (tool === 'Edit') return minus(input.new_string ?? '', input.old_string ?? '');
  if (tool === 'MultiEdit')
    return (input.edits ?? []).flatMap((edit) => minus(edit.new_string ?? '', edit.old_string ?? ''));
  return [];
};

const payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
const filePath = payload.tool_input?.file_path ?? '';
if (!CODE_FILE.test(filePath)) process.exit(0);

const offending = commentsIn(addedLines(payload)).filter(
  (comment) => !ALLOWED.some((rule) => rule.test(comment))
);

if (offending.length === 0) process.exit(0);

process.stderr.write(
  [
    `Blocked: new code comments in ${filePath}.`,
    'This repo keeps code self-explanatory. Remove these comments, or keep one only if it is a TODO/FIXME,',
    'a REK-<n> issue reference, or a tool directive (eslint-disable, @ts-expect-error, prettier-ignore):',
    ...offending.slice(0, 10).map((comment) => `  ${comment}`)
  ].join('\n') + '\n'
);
process.exit(2);
