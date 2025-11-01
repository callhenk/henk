# Available Scripts

This document provides a comprehensive overview of all available scripts in the Henk project, organized by category and purpose.

## 🚀 Root Level Scripts

These scripts are available from the project root and manage the entire monorepo.

### Development Scripts

| Script                 | Command                     | Purpose                                    |
| ---------------------- | --------------------------- | ------------------------------------------ |
| **Development Server** | `pnpm run dev`              | Start all development servers in parallel  |
| **Build**              | `pnpm run build`            | Build all packages and applications        |
| **Clean**              | `pnpm run clean`            | Clean all build artifacts and node_modules |
| **Clean Workspaces**   | `pnpm run clean:workspaces` | Clean all workspace build artifacts        |

### Code Quality Scripts

| Script         | Command               | Purpose                                   |
| -------------- | --------------------- | ----------------------------------------- |
| **Lint**       | `pnpm run lint`       | Run ESLint across all packages            |
| **Lint Fix**   | `pnpm run lint:fix`   | Run ESLint with auto-fix                  |
| **Type Check** | `pnpm run typecheck`  | Run TypeScript checks across all packages |
| **Format**     | `pnpm run format`     | Check code formatting with Prettier       |
| **Format Fix** | `pnpm run format:fix` | Format code with Prettier                 |

### Testing Scripts

| Script            | Command                  | Purpose                           |
| ----------------- | ------------------------ | --------------------------------- |
| **Test**          | `pnpm run test`          | Run all tests across packages     |
| **Test Coverage** | `pnpm run test:coverage` | Run tests with coverage reporting |

### Dependency Management

| Script            | Command                  | Purpose                            |
| ----------------- | ------------------------ | ---------------------------------- |
| **Update**        | `pnpm update`            | Update all dependencies            |
| **Syncpack List** | `pnpm run syncpack:list` | List dependency version mismatches |
| **Syncpack Fix**  | `pnpm run syncpack:fix`  | Fix dependency version mismatches  |

### Pre/Post Install Scripts

| Script          | Command                | Purpose                               |
| --------------- | ---------------------- | ------------------------------------- |
| **Preinstall**  | `pnpm run preinstall`  | Run requirements check before install |
| **Postinstall** | `pnpm run postinstall` | Run manypkg fix after install         |

## 🎯 Web Application Scripts

These scripts are specific to the main web application (`apps/web`).

### Development Scripts

| Script      | Command                         | Purpose                          |
| ----------- | ------------------------------- | -------------------------------- |
| **Dev**     | `pnpm --filter web run dev`     | Start Next.js development server |
| **Build**   | `pnpm --filter web run build`   | Build Next.js application        |
| **Start**   | `pnpm --filter web run start`   | Start production server          |
| **Analyze** | `pnpm --filter web run analyze` | Analyze bundle size              |

### Supabase Scripts

| Script              | Command                                 | Purpose                       |
| ------------------- | --------------------------------------- | ----------------------------- |
| **Supabase Start**  | `pnpm run supabase:web:start`           | Start local Supabase instance |
| **Supabase Stop**   | `pnpm run supabase:web:stop`            | Stop local Supabase instance  |
| **Supabase Status** | `pnpm --filter web run supabase:status` | Check Supabase status         |
| **Supabase Reset**  | `pnpm run supabase:web:reset`           | Reset local database          |
| **Supabase Test**   | `pnpm --filter web run supabase:test`   | Test database connection      |
| **Supabase Deploy** | `pnpm --filter web run supabase:deploy` | Deploy to remote Supabase     |

### Database Scripts

| Script              | Command                                        | Purpose                                 |
| ------------------- | ---------------------------------------------- | --------------------------------------- |
| **Type Generation** | `pnpm run supabase:typegen`                    | Generate TypeScript types from database |
| **DB Lint**         | `pnpm --filter web run supabase:db:lint`       | Lint database schema                    |
| **DB Dump**         | `pnpm --filter web run supabase:db:dump:local` | Dump local database                     |

### Quality Scripts

| Script         | Command                           | Purpose               |
| -------------- | --------------------------------- | --------------------- |
| **Lint**       | `pnpm --filter web run lint`      | Run ESLint on web app |
| **Type Check** | `pnpm --filter web run typecheck` | Run TypeScript checks |
| **Format**     | `pnpm --filter web run format`    | Check code formatting |

## 📦 Package Scripts

### UI Package (`packages/ui`)

| Script         | Command                          | Purpose                  |
| -------------- | -------------------------------- | ------------------------ |
| **Build**      | `pnpm --filter ui run build`     | Build UI components      |
| **Lint**       | `pnpm --filter ui run lint`      | Lint UI components       |
| **Type Check** | `pnpm --filter ui run typecheck` | Type check UI components |

### Features Package (`packages/features`)

| Script         | Command                                | Purpose                     |
| -------------- | -------------------------------------- | --------------------------- |
| **Build**      | `pnpm --filter features run build`     | Build features package      |
| **Lint**       | `pnpm --filter features run lint`      | Lint features package       |
| **Type Check** | `pnpm --filter features run typecheck` | Type check features package |

### Supabase Package (`packages/supabase`)

| Script         | Command                                | Purpose                     |
| -------------- | -------------------------------------- | --------------------------- |
| **Build**      | `pnpm --filter supabase run build`     | Build Supabase package      |
| **Lint**       | `pnpm --filter supabase run lint`      | Lint Supabase package       |
| **Type Check** | `pnpm --filter supabase run typecheck` | Type check Supabase package |

## 🧪 Testing Scripts

### E2E Testing (`apps/e2e`)

| Script         | Command                            | Purpose                     |
| -------------- | ---------------------------------- | --------------------------- |
| **Test**       | `pnpm --filter e2e run test`       | Run E2E tests               |
| **Test UI**    | `pnpm --filter e2e run test:ui`    | Run E2E tests with UI       |
| **Test Debug** | `pnpm --filter e2e run test:debug` | Run E2E tests in debug mode |

## 🔧 Tooling Scripts

### ESLint (`tooling/eslint`)

| Script   | Command                         | Purpose                  |
| -------- | ------------------------------- | ------------------------ |
| **Lint** | `pnpm --filter eslint run lint` | Run ESLint configuration |

### Prettier (`tooling/prettier`)

| Script     | Command                             | Purpose                 |
| ---------- | ----------------------------------- | ----------------------- |
| **Format** | `pnpm --filter prettier run format` | Run Prettier formatting |

### Scripts (`tooling/scripts`)

| Script           | Command                                  | Purpose                        |
| ---------------- | ---------------------------------------- | ------------------------------ |
| **Checks**       | `pnpm --filter scripts run checks`       | Run development checks         |
| **Dev**          | `pnpm --filter scripts run dev`          | Run development utilities      |
| **Requirements** | `pnpm --filter scripts run requirements` | Check environment requirements |

## 🚀 Common Workflows

### Daily Development

```bash
# Start development environment
pnpm run dev

# In another terminal, start Supabase
pnpm run supabase:web:start
```

### Before Committing

```bash
# Run all quality checks
pnpm run lint
pnpm run typecheck
pnpm run format:fix
pnpm run test
```

### Building for Production

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter web run build
```

### Database Management

```bash
# Start local database
pnpm run supabase:web:start

# Reset database
pnpm run supabase:web:reset

# Generate types
pnpm run supabase:typegen
```

### Package Development

```bash
# Work on specific package
pnpm --filter ui run dev

# Test specific package
pnpm --filter auth run test

# Build specific package
pnpm --filter accounts run build
```

## 🔍 Script Parameters

### Environment Variables

Many scripts support environment variables:

```bash
# Development with specific port
PORT=3001 pnpm run dev

# Build with specific environment
NODE_ENV=production pnpm run build

# Test with coverage
COVERAGE=true pnpm run test
```

### Turbo Parameters

Turbo-specific parameters:

```bash
# Run with cache
pnpm run build --cache-dir=.turbo

# Run without cache
pnpm run build --no-cache

# Run in parallel
pnpm run build --parallel
```

## 🐛 Troubleshooting Scripts

### Common Issues

1. **Script Not Found**

   ```bash
   # Check if script exists in package.json
   cat package.json | grep "script_name"

   # Check if package exists
   ls packages/
   ```

2. **Permission Denied**

   ```bash
   # Make script executable
   chmod +x scripts/script-name.sh
   ```

3. **Port Already in Use**

   ```bash
   # Use different port
   PORT=3001 pnpm run dev
   ```

4. **Dependencies Missing**

   ```bash
   # Reinstall dependencies
   pnpm install

   # Clear cache
   pnpm clean
   ```

## 📚 Script Documentation

### Adding New Scripts

When adding new scripts:

1. **Update package.json**: Add script to appropriate package
2. **Document**: Add to this documentation
3. **Test**: Ensure script works in CI/CD
4. **Version**: Update version numbers if needed

### Script Naming Conventions

- Use descriptive names
- Use kebab-case for multi-word scripts
- Prefix with package name when needed
- Use consistent naming across packages

---

## 🎯 Quick Reference

### Most Common Commands

```bash
pnpm run dev                    # Start development
pnpm run build                  # Build for production
pnpm run test                   # Run tests
pnpm run lint                   # Lint code
pnpm run typecheck             # Type check
pnpm run format:fix            # Format code
pnpm run supabase:web:start    # Start database
pnpm run supabase:web:reset    # Reset database
```

### Package-Specific Commands

```bash
pnpm --filter web run dev       # Web app only
pnpm --filter ui run build      # UI package only
pnpm --filter auth run test     # Auth package only
```

---

_This script reference helps you navigate the available commands. For detailed usage, see the individual documentation files._
