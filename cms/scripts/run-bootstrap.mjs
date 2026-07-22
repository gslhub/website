import { spawnSync } from 'node:child_process';

if (process.env.CMS_BOOTSTRAP !== 'true') {
  process.exit(0);
}

const command = process.platform === 'win32' ? 'payload.cmd' : 'payload';
const result = spawnSync(command, ['bootstrap'], {
  env: process.env,
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
