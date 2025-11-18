# Contributing to Henk

Thank you for your interest in contributing to Henk! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Set up your development environment** following the [Quick Start Guide](./docs/quick-start.md)
3. **Create a new branch** for your feature or bug fix

## Development Workflow

### Prerequisites

- Node.js 18.18.0 or higher
- pnpm 9.12.0
- Supabase CLI
- Docker (for local Supabase)

### Setting Up

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start local Supabase
pnpm supabase:web:start

# Start development server
pnpm dev
```

### Making Changes

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style:
   - Use TypeScript strict mode
   - Follow the existing code patterns
   - Add JSDoc comments for functions
   - Use meaningful variable names

3. **Test your changes**:

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test:unit
   ```

4. **Commit your changes** using conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug in component"
   ```

### Commit Message Convention

We follow the Conventional Commits specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Add tests** for new features
3. **Ensure all checks pass**:
   - TypeScript compilation
   - ESLint
   - Tests
   - Build

4. **Submit your PR** with:
   - Clear title following commit conventions
   - Description of changes
   - Related issue numbers (if applicable)
   - Screenshots (for UI changes)

5. **Wait for review** - maintainers will review your PR and may request changes

### PR Checklist

Before submitting your pull request, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`pnpm test:all`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional commits
- [ ] Branch is up to date with main

## Code Style Guidelines

### TypeScript

- Use strict typing - avoid `any`
- Export types alongside components
- Use `type` keyword for type-only imports
- Prefer interfaces for object shapes

### React

- Use Server Components by default
- Only add `'use client'` when necessary
- Use descriptive component names in PascalCase
- Keep components focused and single-purpose

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Routes: `kebab-case` folders

## Database Changes

If your contribution involves database changes:

1. Create a migration:

   ```bash
   supabase migration new your_migration_name
   ```

2. Test locally:

   ```bash
   pnpm supabase:web:reset
   pnpm supabase:test
   ```

3. Generate types:
   ```bash
   pnpm supabase:web:typegen
   ```

## Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots or error messages

## Requesting Features

For feature requests:

- Describe the feature and its use case
- Explain why it would be valuable
- Provide examples or mockups if possible
- Consider implementation complexity

## Questions?

- Check the [documentation](./docs/README.md)
- Open a discussion on GitHub
- Review existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
