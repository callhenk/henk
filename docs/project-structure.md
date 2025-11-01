# Project Structure

This document explains the organization of the Henk monorepo, helping you understand where different components live and how they relate to each other.

## 🏗️ Monorepo Overview

Henk uses a **Turbo monorepo** architecture with the following high-level structure:

```
henk/
├── apps/                    # Applications
│   ├── web/                # Main Next.js web application
│   └── e2e/                # End-to-end testing suite
├── packages/                # Shared packages
│   ├── ui/                 # UI component library
│   ├── auth/               # Authentication system
│   ├── accounts/           # User account management
│   ├── supabase/           # Database and backend services
│   ├── i18n/               # Internationalization
│   ├── next/               # Next.js utilities
│   └── shared/             # Shared utilities and types
├── tooling/                 # Development tools and configurations
├── docs/                    # Documentation (this folder)
└── turbo.json              # Turbo configuration
```

## 📁 Detailed Structure

### `/apps` - Applications

#### `/apps/web` - Main Web Application

The primary Next.js application that serves the Henk platform.

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Marketing pages (landing, pricing, etc.)
│   ├── (legal)/            # Legal pages (privacy, terms, etc.)
│   ├── auth/               # Authentication pages
│   ├── home/               # Main application dashboard
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # App-specific components
├── config/                 # Application configuration
├── lib/                    # Utility functions and types
├── middleware.ts           # Next.js middleware
├── supabase/               # Supabase configuration
│   ├── config.toml        # Supabase project config
│   ├── migrations/         # Database migrations
│   └── seed.sql           # Database seed data
├── styles/                 # Global styles and themes
└── package.json           # Web app dependencies
```

#### `/apps/e2e` - End-to-End Testing

Playwright-based testing suite for full application testing.

```
apps/e2e/
├── tests/                  # Test files
│   ├── account/           # Account-related tests
│   ├── authentication/    # Auth flow tests
│   └── utils/             # Test utilities
├── playwright.config.ts   # Playwright configuration
└── package.json          # E2E testing dependencies
```

### `/packages` - Shared Packages

#### `/packages/ui` - UI Component Library

Reusable UI components built with Radix UI and Tailwind CSS.

```
packages/ui/
├── src/
│   ├── henk/              # Custom UI components
│   ├── shadcn/            # Shadcn UI components
│   ├── hooks/             # UI-related hooks
│   └── lib/               # UI utilities
├── components.json        # Shadcn configuration
└── package.json          # UI package dependencies
```

#### `/packages/features` - Feature Packages

Modular feature packages including authentication, accounts, and other features.

```
packages/features/
└── src/
    └── # Feature-specific code and components
```

#### `/packages/supabase` - Database & Backend Services

Supabase client configuration and database utilities.

```
packages/supabase/
├── src/
│   ├── clients/           # Supabase client configurations
│   ├── hooks/             # Supabase-related hooks
│   ├── auth.ts            # Auth utilities
│   └── database.types.ts  # Generated database types
└── package.json          # Supabase package dependencies
```

#### `/packages/i18n` - Internationalization

Multi-language support and translation management.

```
packages/i18n/
├── src/
│   ├── i18n.client.ts     # Client-side i18n
│   ├── i18n.server.ts     # Server-side i18n
│   └── i18n-provider.tsx  # React i18n provider
└── package.json          # i18n package dependencies
```

#### `/packages/next` - Next.js Utilities

Next.js-specific utilities and configurations.

```
packages/next/
├── src/
│   ├── actions/           # Next.js server actions
│   ├── routes/            # API route utilities
│   └── utils/             # Next.js utilities
└── package.json          # Next.js package dependencies
```

#### `/packages/shared` - Shared Utilities

Common utilities, types, and configurations used across packages.

```
packages/shared/
├── src/
│   ├── events/            # Event system
│   ├── hooks/             # Shared hooks
│   ├── logger/            # Logging utilities
│   └── utils.ts           # Common utilities
└── package.json          # Shared package dependencies
```

### `/tooling` - Development Tools

#### `/tooling/eslint` - ESLint Configuration

Shared ESLint configurations for code quality.

```
tooling/eslint/
├── apps.js               # App-specific ESLint config
├── base.js               # Base ESLint configuration
├── nextjs.js             # Next.js ESLint rules
└── package.json          # ESLint dependencies
```

#### `/tooling/prettier` - Prettier Configuration

Code formatting configuration.

```
tooling/prettier/
├── index.mjs             # Prettier configuration
└── package.json          # Prettier dependencies
```

#### `/tooling/typescript` - TypeScript Configuration

Shared TypeScript configurations.

```
tooling/typescript/
├── base.json             # Base TypeScript config
└── package.json          # TypeScript dependencies
```

#### `/tooling/scripts` - Development Scripts

Utility scripts for development and deployment.

```
tooling/scripts/
├── src/
│   ├── checks.mjs        # Code quality checks
│   ├── dev.mjs           # Development utilities
│   └── requirements.mjs  # Environment requirements
└── package.json          # Script dependencies
```

## 🔗 Package Dependencies

### Dependency Graph

```
apps/web
├── @kit/ui              # UI components
├── @kit/auth            # Authentication
├── @kit/accounts        # Account management
├── @kit/supabase        # Database services
├── @kit/i18n            # Internationalization
└── @kit/next            # Next.js utilities

packages/ui
├── @kit/shared          # Shared utilities
└── (external deps)      # Radix UI, Tailwind, etc.

packages/features
├── @kit/supabase        # Database services
├── @kit/ui              # UI components
└── @kit/shared          # Shared utilities
```

## 📦 Package Management

### Workspace Configuration

- **Package Manager**: pnpm (v9.12.0)
- **Workspace**: Configured in `pnpm-workspace.yaml`
- **Dependencies**: Managed with workspace protocol (`workspace:*`)

### Key Configuration Files

| File                  | Purpose                          |
| --------------------- | -------------------------------- |
| `pnpm-workspace.yaml` | Defines workspace packages       |
| `turbo.json`          | Turbo build system configuration |
| `package.json`        | Root package configuration       |
| `tsconfig.json`       | Root TypeScript configuration    |

## 🎯 Development Workflow

### Adding New Features

1. **UI Components**: Add to `packages/ui/src/henk/`
2. **Features**: Add to `packages/features/src/`
3. **Database Changes**: Add migrations to `apps/web/supabase/migrations/`
4. **App Features**: Add to `apps/web/app/`

### Package Development

```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm run build

# Run development server
pnpm run dev

# Run tests across all packages
pnpm run test
```

## 🔍 Key Files to Know

### Configuration Files

- `turbo.json` - Build system configuration
- `pnpm-workspace.yaml` - Workspace definition
- `apps/web/next.config.mjs` - Next.js configuration
- `apps/web/supabase/config.toml` - Supabase configuration

### Entry Points

- `apps/web/app/layout.tsx` - Root application layout
- `apps/web/app/page.tsx` - Home page
- `apps/web/middleware.ts` - Request middleware
- `packages/ui/src/index.ts` - UI component exports

### Database

- `apps/web/supabase/migrations/` - Database schema changes
- `apps/web/supabase/seed.sql` - Initial data
- `packages/supabase/src/database.types.ts` - Generated types

---

## 🚀 Next Steps

- **[Tech Stack](./tech-stack.md)** - Understand the technologies used
- **[Development Workflow](./development-workflow.md)** - Learn development process
- **[Available Scripts](./scripts.md)** - See all available commands

---

_This structure guide helps you navigate the codebase. For specific implementation details, see the individual package documentation._
