#!/usr/bin/env node

/**
 * Pre-commit hook to check for secrets and API keys
 * Prevents accidental commit of sensitive data
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

// Common API key patterns
const SECRET_PATTERNS = [
  {
    name: 'OpenAI API Key',
    pattern: /sk-proj-[A-Za-z0-9_-]{20,}/gi,
    severity: 'high',
  },
  {
    name: 'OpenAI Legacy API Key',
    pattern: /sk-[A-Za-z0-9]{20,}/gi,
    severity: 'high',
  },
  {
    name: 'ElevenLabs API Key',
    pattern: /sk_[a-f0-9]{64}/gi,
    severity: 'high',
  },
  {
    name: 'Supabase Service Role Key',
    pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/gi,
    severity: 'high',
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/gi,
    severity: 'high',
  },
  {
    name: 'Generic API Key',
    pattern: /api[_-]?key\s*[:=]\s*['"]?[A-Za-z0-9_-]{20,}['"]?/gi,
    severity: 'medium',
  },
  {
    name: 'Generic Secret',
    pattern: /secret\s*[:=]\s*['"]?[A-Za-z0-9_-]{20,}['"]?/gi,
    severity: 'medium',
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE KEY-----/gi,
    severity: 'high',
  },
];

// Files that should never be committed
const FORBIDDEN_FILES = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test',
  'credentials.json',
  'serviceAccount.json',
];

// Files/paths to skip (allowed to contain secrets)
const ALLOWED_PATHS = [
  '.gitignore',
  'scripts/check-secrets.mjs', // This file (contains patterns)
  'apps/web/supabase/seed.sql', // Test data
  'CLAUDE.md', // Documentation
  'apps/e2e/.env.example', // E2E test environment example (uses public Supabase local dev keys)
  'apps/e2e/tests/utils/test-db-setup.ts', // E2E test utilities (uses public Supabase local dev keys)
];

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error(`${RED}Error getting staged files:${RESET}`, error.message);
    return [];
  }
}

function checkForbiddenFiles(files) {
  const forbidden = files.filter((file) => {
    const fileName = file.split('/').pop();
    return FORBIDDEN_FILES.includes(fileName);
  });

  if (forbidden.length > 0) {
    console.error(`\n${RED}❌ ERROR: Attempting to commit sensitive files!${RESET}`);
    console.error(`\nThe following files should NEVER be committed:\n`);
    forbidden.forEach((file) => {
      console.error(`  ${RED}✗${RESET} ${file}`);
    });
    console.error(`\n${YELLOW}These files are in .gitignore and should not be committed.${RESET}`);
    console.error(`${YELLOW}If you need to commit them, add them to .gitignore first.${RESET}\n`);
    return false;
  }

  return true;
}

function checkFileForSecrets(filePath, content) {
  // Skip allowed paths
  if (ALLOWED_PATHS.some((allowed) => filePath.includes(allowed))) {
    return { hasSecrets: false, findings: [] };
  }

  const findings = [];
  const lines = content.split('\n');

  SECRET_PATTERNS.forEach((pattern) => {
    lines.forEach((line, index) => {
      const matches = line.match(pattern.pattern);
      if (matches) {
        // Skip if it's a comment or documentation
        const trimmedLine = line.trim();
        if (
          trimmedLine.startsWith('//') ||
          trimmedLine.startsWith('#') ||
          trimmedLine.startsWith('*') ||
          trimmedLine.startsWith('<!--')
        ) {
          return;
        }

        // Skip example/placeholder values
        if (
          line.includes('your-api-key') ||
          line.includes('YOUR_API_KEY') ||
          line.includes('example') ||
          line.includes('placeholder') ||
          line.includes('xxx')
        ) {
          return;
        }

        matches.forEach((match) => {
          findings.push({
            pattern: pattern.name,
            severity: pattern.severity,
            line: index + 1,
            match: match.substring(0, 20) + '...',
            fullLine: line.trim().substring(0, 100),
          });
        });
      }
    });
  });

  return { hasSecrets: findings.length > 0, findings };
}

function main() {
  console.log(`${BLUE}🔐 Checking for secrets and API keys...${RESET}\n`);

  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log(`${BLUE}ℹ No staged files to check${RESET}`);
    process.exit(0);
  }

  // Check for forbidden files
  const forbiddenCheck = checkForbiddenFiles(stagedFiles);
  if (!forbiddenCheck) {
    process.exit(1);
  }

  // Check file contents for secrets
  const violations = [];

  stagedFiles.forEach((file) => {
    // Skip binary files and certain extensions
    if (
      file.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp3|mp4|pdf)$/i)
    ) {
      return;
    }

    try {
      const content = readFileSync(file, 'utf-8');
      const result = checkFileForSecrets(file, content);

      if (result.hasSecrets) {
        violations.push({ file, findings: result.findings });
      }
    } catch (error) {
      // File might be deleted or binary
      if (error.code !== 'ENOENT') {
        console.warn(`${YELLOW}⚠ Could not read ${file}: ${error.message}${RESET}`);
      }
    }
  });

  if (violations.length > 0) {
    console.error(`${RED}❌ ERROR: Potential secrets detected in staged files!${RESET}\n`);

    violations.forEach(({ file, findings }) => {
      console.error(`${RED}File: ${file}${RESET}`);
      findings.forEach((finding) => {
        console.error(
          `  Line ${finding.line}: ${finding.pattern} (${finding.severity} severity)`,
        );
        console.error(`    ${YELLOW}${finding.fullLine}${RESET}`);
      });
      console.error('');
    });

    console.error(`${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.error(`${RED}COMMIT BLOCKED - Secrets detected!${RESET}\n`);
    console.error(`${YELLOW}Action required:${RESET}`);
    console.error(`  1. Remove the secrets from your code`);
    console.error(`  2. Use environment variables instead`);
    console.error(`  3. Add sensitive files to .gitignore`);
    console.error(`  4. If this is a false positive, update scripts/check-secrets.mjs\n`);
    console.error(
      `${YELLOW}If you've already committed secrets, you MUST rotate them immediately!${RESET}`,
    );
    console.error(`${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

    process.exit(1);
  }

  console.log(`${BLUE}✅ No secrets detected in staged files${RESET}\n`);
  process.exit(0);
}

main();
