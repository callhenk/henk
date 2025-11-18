# Database Safety Guidelines

This document outlines safeguards to prevent accidental production database operations.

## Safe Commands (Local Only)

These commands **ONLY** affect your local development database:

```bash
pnpm supabase:start      # Start local Supabase
pnpm supabase:stop       # Stop local Supabase
pnpm supabase:reset      # Reset LOCAL database (explicit --local flag)
pnpm supabase:status     # Check local status
pnpm supabase:test       # Run database tests
pnpm supabase:db:lint    # Lint local database
pnpm supabase:typegen    # Generate types from LOCAL schema
```

All these commands have been configured with explicit `--local` flags where applicable.

## Production Commands (DANGEROUS)

### Blocked Command

```bash
pnpm supabase:deploy:UNSAFE
```

This command is **BLOCKED** and will show a warning. It exists to prevent muscle memory accidents.

### Safe Production Deployment

```bash
pnpm supabase:deploy:safe
```

This uses the safe deployment script with multiple safeguards:

1. **Environment Variable Check**: Requires `SUPABASE_PROJECT_REF` to be explicitly set
2. **First Confirmation**: Must type `DEPLOY TO PRODUCTION` exactly
3. **Migration Review**: Shows count of pending migrations
4. **Final Confirmation**: Must type `YES` to proceed

Example:

```bash
export SUPABASE_PROJECT_REF=your-project-ref
pnpm supabase:deploy:safe
# Follow the confirmation prompts
```

## Environment Variables

**Local Development** (.env.local):

- Never set `SUPABASE_PROJECT_REF` in local environment files
- Uses local Supabase instance by default

**Production**:

- `SUPABASE_PROJECT_REF` should only be set in CI/CD or when explicitly deploying
- Never commit this value to git

## How to Verify You're Working Locally

Run `pnpm supabase:status` and check for localhost URLs:

```
API URL: http://127.0.0.1:54321     ← Local
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres  ← Local
```

If you see different domains, you may be linked to production!

## Emergency: Check Production Link Status

```bash
cd apps/web
supabase projects list
```

If you see a linked project, unlink it:

```bash
supabase unlink
```

## Best Practices

1. ✅ Always run `pnpm supabase:status` first to verify local setup
2. ✅ Use `--local` flag when running manual supabase commands
3. ✅ Never set `SUPABASE_PROJECT_REF` in .env files
4. ✅ Use `supabase:deploy:safe` for production deployments
5. ❌ Never run `supabase db push` without confirmation
6. ❌ Never run `supabase link` casually

## Migration Workflow

### Local Development

```bash
# 1. Create migration
supabase migration new your_migration_name

# 2. Write migration SQL in supabase/migrations/

# 3. Apply to local database
pnpm supabase:reset

# 4. Generate types
pnpm supabase:typegen

# 5. Test locally
pnpm dev
```

### Production Deployment

```bash
# 1. Test thoroughly in local environment
# 2. Commit migrations to git
# 3. Deploy via CI/CD OR use safe deployment:

export SUPABASE_PROJECT_REF=your-project-ref
pnpm supabase:deploy:safe
# Follow confirmation prompts carefully
```

## Additional Safeguards

The safe deployment script (`scripts/safe-deploy.sh`) includes:

- Explicit project ref requirement
- Multiple confirmation steps
- Migration count display
- Clear warning messages
- Exit on any error (set -e)

## Troubleshooting

### "I accidentally linked to production"

```bash
supabase unlink
pnpm supabase:start
```

### "How do I know if I'm linked?"

```bash
cat .supabase/config.toml | grep project_id
# If you see a project_id, you're linked. Run: supabase unlink
```

### "Reset isn't working"

```bash
pnpm supabase:stop
docker volume ls | grep henk
docker volume rm <volume-name>  # if you want to completely wipe data
pnpm supabase:start
```

## Summary

- **All local commands are safe** and have explicit `--local` flags
- **Production deployment requires multiple confirmations**
- **Never set SUPABASE_PROJECT_REF in environment files**
- **Always verify with `supabase:status` before operations**
