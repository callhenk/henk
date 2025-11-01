# Development Workflow

This guide explains how to work effectively with the Henk codebase, from setting up your development environment to contributing code changes.

## 🚀 Development Environment Setup

### Prerequisites

- Node.js v18.18.0+
- pnpm v9.12.0+
- Docker (for Supabase)
- Git

### Initial Setup

```bash
# Clone the repository
git clone git@github.com:callhenk/henk.git
cd henk

# Install dependencies
pnpm install

# Set up environment variables
cp .env.sample .env.local
# Edit .env.local with your configuration

# Start Supabase
pnpm run supabase:web:start

# Start development server
pnpm run dev
```

## 🔄 Daily Development Workflow

### 1. Starting Your Day

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
pnpm install

# Start development environment
pnpm run supabase:web:start
pnpm run dev
```

### 2. Before Making Changes

```bash
# Ensure you're on a feature branch
git checkout -b feature/your-feature-name

# Run quality checks
pnpm run lint
pnpm run typecheck
pnpm run format:fix
```

### 3. During Development

```bash
# Start development server (if not already running)
pnpm run dev

# Run tests as you develop
pnpm run test

# Check for type errors
pnpm run typecheck
```

### 4. Before Committing

```bash
# Run all quality checks
pnpm run lint
pnpm run typecheck
pnpm run format:fix
pnpm run test

# Stage and commit your changes
git add .
git commit -m "feat: add new feature description"
```

## 📝 Code Contribution Process

### 1. Creating a Feature Branch

```bash
# Create a new branch from main
git checkout main
git pull origin main
git checkout -b feature/descriptive-feature-name

# Or for bug fixes
git checkout -b fix/descriptive-bug-name
```

### 2. Making Changes

- **UI Components**: Add to `packages/ui/src/henk/`
- **Feature Packages**: Add to `packages/features/src/`
- **Database Changes**: Add migrations to `apps/web/supabase/migrations/`
- **App Features**: Add to `apps/web/app/`

### 3. Testing Your Changes

```bash
# Run unit tests
pnpm run test

# Run type checking
pnpm run typecheck

# Run linting
pnpm run lint

# Run E2E tests (if applicable)
cd apps/e2e
pnpm run test
```

### 4. Committing Changes

Follow conventional commit format:

```bash
git commit -m "type(scope): description"

# Examples:
git commit -m "feat(auth): add multi-factor authentication"
git commit -m "fix(ui): resolve button alignment issue"
git commit -m "docs(readme): update installation instructions"
```

### 5. Pushing and Creating PR

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a pull request on GitHub
# Include:
# - Clear description of changes
# - Screenshots (if UI changes)
# - Test coverage information
```

## 🧪 Testing Strategy

### Unit Tests

- **Location**: `__tests__/` folders in each package
- **Framework**: Jest + React Testing Library
- **Command**: `pnpm run test`

### Integration Tests

- **Location**: `apps/web/__tests__/`
- **Focus**: API routes, database operations
- **Command**: `pnpm run test:integration`

### E2E Tests

- **Location**: `apps/e2e/tests/`
- **Framework**: Playwright
- **Command**: `cd apps/e2e && pnpm run test`

### Test Coverage

- **Target**: >90% code coverage
- **Command**: `pnpm run test:coverage`

## 🔍 Code Quality Standards

### Linting

```bash
# Run ESLint
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix
```

### Type Checking

```bash
# Run TypeScript checks
pnpm run typecheck
```

### Formatting

```bash
# Check formatting
pnpm run format

# Auto-format code
pnpm run format:fix
```

### Pre-commit Hooks

The project uses pre-commit hooks to ensure code quality:

- Automatic formatting
- Linting checks
- Type checking
- Test running

## 📦 Package Development

### Adding New Packages

```bash
# Create new package structure
mkdir packages/new-package
cd packages/new-package

# Initialize package
pnpm init

# Add to workspace
# Edit pnpm-workspace.yaml to include new package
```

### Updating Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update package-name

# Check for dependency mismatches
pnpm run syncpack:list
pnpm run syncpack:fix
```

### Building Packages

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter package-name run build
```

## 🗄️ Database Development

### Creating Migrations

```bash
# Create new migration
cd apps/web
supabase migration new migration_name

# Edit the generated migration file
# Apply migration
supabase db push
```

### Working with Local Database

```bash
# Start Supabase
pnpm run supabase:web:start

# Reset database
pnpm run supabase:web:reset

# View database in Studio
# Visit: http://localhost:54323
```

### Type Generation

```bash
# Generate TypeScript types from database
pnpm run supabase:typegen
```

## 🚀 Deployment Workflow

### Staging Deployment

```bash
# Deploy to staging
git push origin main
# Vercel automatically deploys from main branch
```

### Production Deployment

```bash
# Create release branch
git checkout -b release/v1.2.3

# Update version numbers
# Update CHANGELOG.md

# Merge to main
git checkout main
git merge release/v1.2.3
git push origin main
```

## 🔧 Development Scripts

### Common Commands

| Command                       | Purpose                  |
| ----------------------------- | ------------------------ |
| `pnpm run dev`                | Start development server |
| `pnpm run build`              | Build for production     |
| `pnpm run test`               | Run all tests            |
| `pnpm run lint`               | Run ESLint               |
| `pnpm run typecheck`          | Run TypeScript checks    |
| `pnpm run format:fix`         | Format code              |
| `pnpm run supabase:web:start` | Start local Supabase     |
| `pnpm run supabase:web:reset` | Reset local database     |

### Package-Specific Commands

```bash
# Run commands for specific package
pnpm --filter ui run build
pnpm --filter auth run test
pnpm --filter web run dev
```

## 🐛 Debugging

### Common Issues

1. **Supabase Connection Issues**

   ```bash
   pnpm run supabase:web:status
   pnpm run supabase:web:reset
   ```

2. **Type Errors**

   ```bash
   pnpm run typecheck
   pnpm run supabase:typegen
   ```

3. **Build Failures**
   ```bash
   pnpm clean
   pnpm install
   pnpm run build
   ```

### Debug Tools

- **React DevTools**: Browser extension for React debugging
- **Supabase Studio**: http://localhost:54323 for database debugging
- **Vercel Analytics**: For performance monitoring
- **Logs**: Check browser console and server logs

## 📚 Documentation

### Writing Documentation

- **Code Comments**: Use JSDoc for complex functions
- **README Files**: Update package READMEs when adding features
- **API Documentation**: Document new API endpoints
- **Component Documentation**: Document new UI components

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up-to-date
- Use consistent formatting

## 🤝 Code Review Process

### Before Submitting PR

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] TypeScript checks pass
- [ ] Documentation is updated
- [ ] No console errors or warnings

### Review Checklist

- [ ] Code is readable and well-structured
- [ ] Proper error handling
- [ ] Security considerations
- [ ] Performance implications
- [ ] Accessibility compliance

---

## 🎯 Next Steps

- **[Project Structure](./project-structure.md)** - Understand the codebase organization
- **[Available Scripts](./scripts.md)** - See all available commands
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

---

_This workflow guide ensures consistent development practices across the team. For specific technical details, see the individual documentation files._
