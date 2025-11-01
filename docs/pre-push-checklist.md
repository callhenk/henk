# Pre-Push Checklist

This checklist helps ensure all guidelines are followed before pushing code to the repository.

## 🤖 Automated Checks (Run Automatically)

These checks run automatically via **Husky pre-commit hooks**:

### ✅ On Every Commit

- **Formatting**: Prettier formats all staged files
- **Linting**: ESLint fixes auto-fixable issues
- **Type Checking**: TypeScript type validation
- **Documentation Validation**: Checks file naming and broken links

The pre-commit hook will **prevent the commit** if any of these fail.

## 🔍 Manual Checklist (Before Pushing)

### 1. Code Quality

```bash
# Run all checks locally
pnpm typecheck
pnpm lint
pnpm format

# Run tests
pnpm test:unit
pnpm test:integration  # If you modified API routes or database
```

### 2. Database Changes

If you modified database schema:

```bash
# Test migrations locally
pnpm supabase:web:reset

# Verify types are regenerated
pnpm supabase:web:typegen

# Check migration files
ls apps/web/supabase/migrations/

# Lint database
pnpm --filter web supabase:db:lint
```

### 3. Documentation

```bash
# Validate documentation
node scripts/validate-docs.mjs

# Check file naming (kebab-case)
ls docs/*.md

# Verify links work
# Check README.md references /docs files correctly
```

### 4. Build Test

```bash
# Ensure production build works
pnpm build
```

## 📋 Quick Pre-Push Command

Run all essential checks at once:

```bash
pnpm typecheck && pnpm lint && pnpm test:unit && node scripts/validate-docs.mjs && pnpm build
```

Or create an alias in your shell:

```bash
# Add to ~/.zshrc or ~/.bashrc
alias pre-push="pnpm typecheck && pnpm lint && pnpm test:unit && node scripts/validate-docs.mjs"
```

## 🚨 CI/CD Checks (Runs on Push)

When you push to `main` or create a PR, GitHub Actions runs:

1. **Code Quality**: Type checking, linting, formatting
2. **Database Tests**: Migrations, RLS policies, functions
3. **Unit Tests**: Component and utility tests
4. **Integration Tests**: API route tests
5. **E2E Tests**: Full user flow tests (Playwright)
6. **Build Test**: Production build verification
7. **Security Audit**: Dependency vulnerability scan
8. **Documentation Validation**: File naming and link checks

**All checks must pass** before merging to main.

## 📚 Documentation Guidelines

### File Naming

- ✅ Use **kebab-case**: `quick-start.md`, `storage-buckets.md`
- ❌ Avoid **SCREAMING_SNAKE_CASE**: `QA_PLAN.md`, `STORAGE_BUCKETS.md`
- ✅ Exception: `README.md` (standard convention)

### Package References

- ✅ Use actual packages: `packages/features`, `packages/ui`
- ❌ Avoid non-existent packages: `packages/auth`, `packages/accounts`

### Environment Files

- ✅ Reference `.env.sample` (actual file)
- ❌ Reference `.env.example` (doesn't exist)

### Links

- ✅ Use relative paths: `[Quick Start](./quick-start.md)`
- ✅ Use absolute paths from root: `[Quick Start](/docs/quick-start.md)`
- ❌ Don't link to non-existent files

## 🔧 Troubleshooting

### Pre-commit Hook Fails

```bash
# If typecheck fails
pnpm typecheck

# If linting fails
pnpm lint:fix

# If formatting fails
pnpm format:fix

# If docs validation fails
node scripts/validate-docs.mjs
```

### Skip Hooks (Use Sparingly!)

```bash
# Only use in emergencies
git commit --no-verify

# Then fix issues immediately:
pnpm lint:fix
pnpm format:fix
```

### CI Fails After Push

1. Check GitHub Actions tab in repository
2. Review failed job logs
3. Fix issues locally
4. Push fix

## 📊 Example Workflow

```bash
# 1. Make changes
vim apps/web/app/page.tsx

# 2. Stage changes
git add .

# 3. Commit (pre-commit hook runs automatically)
git commit -m "Add new feature"

# 4. Run manual checks before push
pnpm test:unit
pnpm build

# 5. Push to remote
git push origin main

# 6. Verify CI passes on GitHub
```

## 🎯 Best Practices

1. **Commit often**: Smaller commits are easier to review
2. **Run tests**: Don't rely solely on CI
3. **Test migrations**: Always test database changes locally first
4. **Update docs**: Keep documentation in sync with code changes
5. **Fix hooks**: Don't skip pre-commit hooks unless absolutely necessary

## 📖 Related Documentation

- [Development Workflow](./development-workflow.md) - Complete development guide
- [Supabase Local Development](./supabase-local-development.md) - Database testing
- [QA Plan](./qa-plan.md) - Testing strategy
- [Troubleshooting](./troubleshooting.md) - Common issues and fixes

---

_This checklist is enforced via Husky pre-commit hooks and GitHub Actions CI/CD._
