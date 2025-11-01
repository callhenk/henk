# Troubleshooting Guide

This guide helps you resolve common issues you might encounter while working with the Henk project.

## 🚨 Common Issues

### Development Environment Issues

#### 1. Node.js Version Issues

**Problem**: "Node.js version not supported" or similar errors.

**Solution**:

```bash
# Check your Node.js version
node --version

# Should be v18.18.0 or higher
# If not, install the correct version:
# Visit: https://nodejs.org/
# Or use nvm:
nvm install 18.18.0
nvm use 18.18.0
```

#### 2. pnpm Not Found

**Problem**: "pnpm: command not found"

**Solution**:

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
# Should be v9.12.0 or higher
```

#### 3. Docker Not Running

**Problem**: Supabase won't start or "Docker not found"

**Solution**:

```bash
# Check if Docker is running
docker --version
docker ps

# Start Docker Desktop if not running
# On macOS: Open Docker Desktop app
# On Linux: sudo systemctl start docker
```

### Installation Issues

#### 4. Dependencies Installation Fails

**Problem**: `pnpm install` fails with errors

**Solution**:

```bash
# Clear cache and reinstall
pnpm clean
rm -rf node_modules
pnpm install

# If still failing, try:
pnpm install --force
```

#### 5. Workspace Issues

**Problem**: "Package not found" or workspace errors

**Solution**:

```bash
# Check workspace configuration
cat pnpm-workspace.yaml

# Reinstall with workspace fix
pnpm install
pnpm run postinstall
```

### Development Server Issues

#### 6. Port Already in Use

**Problem**: "Port 3000 is already in use"

**Solution**:

```bash
# Check what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm run dev
```

#### 7. Development Server Won't Start

**Problem**: `pnpm run dev` fails to start

**Solution**:

```bash
# Check for TypeScript errors
pnpm run typecheck

# Check for linting errors
pnpm run lint

# Clear Next.js cache
rm -rf apps/web/.next
pnpm run dev
```

### Supabase Issues

#### 8. Supabase Won't Start

**Problem**: `pnpm run supabase:web:start` fails

**Solution**:

```bash
# Check Supabase status
pnpm run supabase:web:status

# Reset Supabase completely
pnpm run supabase:web:stop
pnpm run supabase:web:reset
pnpm run supabase:web:start

# If still failing, check Docker
docker ps
docker logs supabase-db
```

#### 9. Database Connection Issues

**Problem**: "Cannot connect to database" or 401 errors

**Solution**:

```bash
# Check environment variables
cat .env.local | grep SUPABASE

# Ensure these are set:
# SUPABASE_URL=your_project_url
# SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Regenerate types
pnpm run supabase:typegen
```

#### 10. Migration Issues

**Problem**: Database migrations fail

**Solution**:

```bash
# Reset database completely
pnpm run supabase:web:reset

# Check migration files
ls apps/web/supabase/migrations/

# Apply migrations manually
cd apps/web
supabase db push
```

### Build Issues

#### 11. Build Fails

**Problem**: `pnpm run build` fails

**Solution**:

```bash
# Check for TypeScript errors
pnpm run typecheck

# Check for linting errors
pnpm run lint

# Clean and rebuild
pnpm clean
pnpm install
pnpm run build
```

#### 12. Package Build Issues

**Problem**: Specific package fails to build

**Solution**:

```bash
# Build specific package
pnpm --filter package-name run build

# Check package dependencies
cat packages/package-name/package.json

# Reinstall package dependencies
pnpm --filter package-name install
```

### TypeScript Issues

#### 13. Type Errors

**Problem**: TypeScript compilation errors

**Solution**:

```bash
# Run type checking
pnpm run typecheck

# Regenerate database types
pnpm run supabase:typegen

# Check for missing types
pnpm --filter web run typecheck
```

#### 14. Missing Type Definitions

**Problem**: "Cannot find module" or missing types

**Solution**:

```bash
# Install missing types
pnpm add -D @types/package-name

# Regenerate types
pnpm run supabase:typegen

# Check TypeScript configuration
cat tsconfig.json
```

### Testing Issues

#### 15. Tests Fail

**Problem**: `pnpm run test` fails

**Solution**:

```bash
# Run tests with verbose output
pnpm run test --verbose

# Run specific test file
pnpm run test -- path/to/test.ts

# Check test configuration
cat jest.config.js
```

#### 16. E2E Test Issues

**Problem**: Playwright tests fail

**Solution**:

```bash
# Install Playwright browsers
cd apps/e2e
npx playwright install

# Run tests with UI
pnpm run test:ui

# Run in debug mode
pnpm run test:debug
```

### Environment Issues

#### 17. Environment Variables Missing

**Problem**: "Environment variable not found"

**Solution**:

```bash
# Check if .env.local exists
ls -la .env.local

# Copy example if missing
cp .env.sample .env.local

# Edit environment file
nano .env.local
```

#### 18. API Keys Invalid

**Problem**: "Invalid API key" errors

**Solution**:

```bash
# Check environment variables
echo $SUPABASE_URL
echo $TWILIO_ACCOUNT_SID
echo $ELEVENLABS_API_KEY

# Verify keys are correct
# Supabase: Check project settings
# Twilio: Check console for correct SID/token
# ElevenLabs: Check API key in dashboard
```

### Performance Issues

#### 19. Slow Development Server

**Problem**: `pnpm run dev` is slow

**Solution**:

```bash
# Clear cache
pnpm clean
rm -rf apps/web/.next

# Use turbo cache
pnpm run dev --cache-dir=.turbo

# Check for memory issues
# Increase Node.js memory if needed
NODE_OPTIONS="--max-old-space-size=4096" pnpm run dev
```

#### 20. Large Bundle Size

**Problem**: Build produces large bundles

**Solution**:

```bash
# Analyze bundle
pnpm --filter web run analyze

# Check for duplicate dependencies
pnpm run syncpack:list

# Fix dependency mismatches
pnpm run syncpack:fix
```

## 🔧 Debug Tools

### Development Tools

- **React DevTools**: Browser extension for React debugging
- **Supabase Studio**: http://localhost:54323 for database debugging
- **Vercel Analytics**: For performance monitoring
- **Browser DevTools**: For frontend debugging

### Logging

```bash
# Check application logs
pnpm run dev | pino-pretty

# Check Supabase logs
supabase logs

# Check Docker logs
docker logs supabase-db
```

### Network Debugging

```bash
# Check API endpoints
curl http://localhost:3000/api/health

# Check Supabase connection
curl http://localhost:54321/health

# Check webhook endpoints
curl -X POST http://localhost:3000/api/twilio/webhook
```

## 🆘 Getting Help

### Before Asking for Help

1. **Check this guide** for your specific issue
2. **Search existing issues** on GitHub
3. **Check the logs** for error messages
4. **Try the solutions** listed above

### When Asking for Help

Include the following information:

- **Error message** (full text)
- **Steps to reproduce** the issue
- **Environment details** (OS, Node.js version, etc.)
- **What you've tried** already
- **Relevant logs** or screenshots

### Resources

- **[Development Workflow](./development-workflow.md)** - Development process
- **[Project Structure](./project-structure.md)** - Codebase organization
- **[Scripts Reference](./scripts.md)** - Available commands
- **GitHub Issues** - Search existing issues
- **Discord/Slack** - Team communication

## 🚀 Prevention Tips

### Best Practices

1. **Keep dependencies updated**: `pnpm update`
2. **Run quality checks**: `pnpm run lint && pnpm run typecheck`
3. **Test regularly**: `pnpm run test`
4. **Use proper branches**: Create feature branches for changes
5. **Commit frequently**: Small, focused commits

### Environment Setup

1. **Use correct Node.js version**: v18.18.0+
2. **Use pnpm**: v9.12.0+
3. **Keep Docker running**: For Supabase
4. **Set environment variables**: Copy from `.env.sample`

### Development Habits

1. **Pull latest changes**: `git pull origin main`
2. **Install dependencies**: `pnpm install`
3. **Start services**: `pnpm run supabase:web:start`
4. **Check status**: `pnpm run typecheck && pnpm run lint`

---

## 🎯 Quick Fixes

### Most Common Solutions

```bash
# Reset everything
pnpm clean
pnpm install
pnpm run supabase:web:reset
pnpm run dev

# Fix TypeScript issues
pnpm run supabase:typegen
pnpm run typecheck

# Fix formatting
pnpm run format:fix

# Fix linting
pnpm run lint:fix
```

---

_This troubleshooting guide covers the most common issues. If your problem isn't listed, check the [Development Workflow](./development-workflow.md) or ask for help in the team chat._
