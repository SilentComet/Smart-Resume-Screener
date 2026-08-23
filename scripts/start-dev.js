import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Smart Resume Screener (Backend + Frontend)...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Spawn Server
const server = spawn(npmCmd, ['start'], {
  cwd: path.join(rootDir, 'server'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: process.env.PORT || '5000' }
});

// Spawn Client
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'client'),
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Shutting down services...');
  server.kill();
  client.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
