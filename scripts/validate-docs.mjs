#!/usr/bin/env node

/**
 * Documentation Validation Script
 *
 * This script validates:
 * 1. File naming conventions (kebab-case)
 * 2. Broken links in documentation
 * 3. Referenced files exist
 * 4. Consistent package references
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');

let hasErrors = false;
let warnings = [];

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function error(message) {
  hasErrors = true;
  log(`❌ ${message}`, 'red');
}

function warn(message) {
  warnings.push(message);
  log(`⚠️  ${message}`, 'yellow');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Rule 1: Check file naming conventions
function validateFileNaming() {
  info('Checking file naming conventions...');

  const files = fs.readdirSync(docsDir);
  const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'README.md');

  const invalidNames = mdFiles.filter(file => {
    // Check if file follows kebab-case
    const nameWithoutExt = file.replace('.md', '');
    const isKebabCase = /^[a-z]+(-[a-z]+)*$/.test(nameWithoutExt);
    return !isKebabCase;
  });

  if (invalidNames.length > 0) {
    invalidNames.forEach(file => {
      error(`File "${file}" does not follow kebab-case naming convention`);
    });
  } else {
    success('All files follow kebab-case naming convention');
  }
}

// Rule 2: Check for broken internal links
function validateLinks() {
  info('Checking for broken internal links...');

  const files = fs.readdirSync(docsDir)
    .filter(f => f.endsWith('.md'));

  files.push(path.join(rootDir, 'README.md'));

  files.forEach(file => {
    const filePath = file.includes('/') ? file : path.join(docsDir, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    // Find all markdown links: [text](link)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];

      // Skip external links
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        continue;
      }

      // Skip anchors
      if (linkUrl.startsWith('#')) {
        continue;
      }

      // Resolve relative paths
      let targetPath;
      if (linkUrl.startsWith('/docs/')) {
        targetPath = path.join(rootDir, linkUrl.substring(1));
      } else if (linkUrl.startsWith('./')) {
        const baseDir = path.dirname(filePath);
        targetPath = path.join(baseDir, linkUrl.substring(2));
      } else {
        const baseDir = path.dirname(filePath);
        targetPath = path.join(baseDir, linkUrl);
      }

      // Check if target exists
      if (!fs.existsSync(targetPath)) {
        error(`Broken link in ${fileName}: "${linkText}" -> ${linkUrl}`);
      }
    }
  });
}

// Rule 3: Check for references to non-existent packages
function validatePackageReferences() {
  info('Checking package references...');

  const invalidPackages = [
    'packages/auth',
    'packages/accounts',
  ];

  const validPackages = [
    'packages/features',
    'packages/ui',
    'packages/supabase',
    'packages/i18n',
    'packages/next',
    'packages/shared',
  ];

  const files = fs.readdirSync(docsDir)
    .filter(f => f.endsWith('.md') && f !== 'documentation-audit.md');

  files.forEach(file => {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    invalidPackages.forEach(pkg => {
      if (content.includes(pkg)) {
        error(`File ${file} references non-existent package: ${pkg}`);
      }
    });
  });
}

// Rule 4: Check for correct environment file references
function validateEnvFileReferences() {
  info('Checking environment file references...');

  const files = fs.readdirSync(docsDir)
    .filter(f => f.endsWith('.md'));

  files.push(path.join(rootDir, 'README.md'));

  const incorrectRefs = ['.env.example'];
  const correctRef = '.env.sample';

  files.forEach(file => {
    const filePath = file.includes('/') ? file : path.join(docsDir, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    incorrectRefs.forEach(ref => {
      if (content.includes(ref)) {
        error(`File ${fileName} references "${ref}" instead of "${correctRef}"`);
      }
    });
  });
}

// Rule 5: Warn about SCREAMING_SNAKE_CASE files
function warnAboutUppercaseFiles() {
  info('Checking for uppercase file names...');

  const files = fs.readdirSync(docsDir);
  const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'README.md');

  const uppercaseFiles = mdFiles.filter(file => {
    return /[A-Z_]/.test(file.replace('.md', ''));
  });

  if (uppercaseFiles.length > 0) {
    uppercaseFiles.forEach(file => {
      warn(`File "${file}" uses uppercase letters. Consider renaming to kebab-case.`);
    });
  }
}

// Main execution
function main() {
  log('\n📚 Documentation Validation\n', 'blue');

  validateFileNaming();
  validateLinks();
  validatePackageReferences();
  validateEnvFileReferences();
  warnAboutUppercaseFiles();

  log('\n' + '='.repeat(50));

  if (warnings.length > 0) {
    log(`\n⚠️  ${warnings.length} warning(s) found`, 'yellow');
  }

  if (hasErrors) {
    log('\n❌ Documentation validation failed!\n', 'red');
    process.exit(1);
  } else {
    log('\n✅ Documentation validation passed!\n', 'green');
    process.exit(0);
  }
}

main();
