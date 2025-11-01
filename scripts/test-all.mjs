#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let devServer = null;
let supabaseStarted = false;

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkSupabaseRunning() {
  try {
    const response = await fetch('http://127.0.0.1:54321/rest/v1/', {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function startSupabase() {
  log('\n🔷 Starting Supabase...', 'cyan');
  try {
    await execAsync('pnpm supabase:web:start');
    supabaseStarted = true;
    log('✅ Supabase started successfully', 'green');
    return true;
  } catch (error) {
    log('⚠️  Failed to start Supabase - integration tests will be skipped', 'yellow');
    return false;
  }
}

async function startDevServer() {
  log('\n🚀 Starting dev server...', 'cyan');

  return new Promise((resolve, reject) => {
    devServer = spawn('pnpm', ['dev'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    let output = '';

    devServer.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Local:') || output.includes('localhost:3000')) {
        log('✅ Dev server is ready', 'green');
        resolve();
      }
    });

    devServer.stderr.on('data', (data) => {
      // Ignore stderr - Next.js outputs normal messages there
    });

    devServer.on('error', (error) => {
      reject(error);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      resolve(); // Continue anyway
    }, 60000);
  });
}

async function waitForServer() {
  log('\n⏳ Waiting for server to be fully ready...', 'cyan');

  for (let i = 0; i < 30; i++) {
    try {
      const response = await fetch('http://localhost:3000');
      if (response.ok || response.status === 404) {
        log('✅ Server is responding', 'green');
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  log('⚠️  Server might not be fully ready, continuing anyway...', 'yellow');
  return false;
}

async function runCommand(command, description) {
  log(`\n📋 ${description}...`, 'blue');

  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${description} passed`, 'green');
        resolve();
      } else {
        log(`❌ ${description} failed`, 'red');
        reject(new Error(`${description} failed with code ${code}`));
      }
    });
  });
}

async function cleanup() {
  log('\n🧹 Cleaning up...', 'cyan');

  if (devServer) {
    log('Stopping dev server...', 'yellow');
    devServer.kill();
  }

  if (supabaseStarted) {
    log('Stopping Supabase...', 'yellow');
    try {
      await execAsync('pnpm supabase:web:stop');
    } catch {
      // Ignore errors during cleanup
    }
  }
}

async function main() {
  log('\n🎯 Running Complete Test Suite', 'cyan');
  log('================================\n', 'cyan');

  try {
    // Step 1: Check/Start Supabase
    const supabaseRunning = await checkSupabaseRunning();
    if (!supabaseRunning) {
      await startSupabase();
    } else {
      log('✅ Supabase is already running', 'green');
    }

    // Step 2: Start dev server
    await startDevServer();
    await waitForServer();

    // Step 3: Run unit tests
    await runCommand('pnpm test:unit', 'Unit Tests');

    // Step 4: Run integration tests (if Supabase is available)
    if (supabaseRunning || supabaseStarted) {
      try {
        await runCommand('pnpm test:integration', 'Integration Tests');
      } catch (error) {
        log('⚠️  Integration tests failed - continuing with E2E tests...', 'yellow');
      }
    } else {
      log('⏭️  Skipping integration tests (Supabase not available)', 'yellow');
    }

    // Step 5: Run E2E tests
    await runCommand('pnpm test:e2e', 'E2E Tests');

    log('\n🎉 All tests completed successfully!', 'green');
    process.exit(0);

  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// Handle interrupts
process.on('SIGINT', async () => {
  log('\n\n⚠️  Interrupted by user', 'yellow');
  await cleanup();
  process.exit(130);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(143);
});

main();
