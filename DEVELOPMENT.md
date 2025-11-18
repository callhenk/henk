# Local Development Guide

This guide covers setting up and running the Henk platform in local development mode.

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Supabase

```bash
pnpm supabase:start
```

This will start a local Supabase instance with PostgreSQL, PostgREST, Auth, and Storage.

### 3. Seed the Database

Reset and seed the local database with test data:

```bash
pnpm supabase:reset
```

This will:

- Reset the local database
- Apply all migrations
- **Automatically seed test data** from `apps/web/supabase/seed.sql`

### 4. Start the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Test Account

After seeding, you can log in with:

- **Email**: `cyrus@callhenk.com`
- **Password**: `Test123?`

## Seeded Data

The seed script (`apps/web/supabase/seed.sql`) creates:

### User & Organization

- ✅ **Test User**: cyrus@callhenk.com (password: Test123?)
- ✅ **Account**: Cyrus David
- ✅ **Business**: Henk Demo Organization
- ✅ **Role**: Owner

### Agents (3)

1. **Sarah - General Fundraising**
   - Friendly and engaging fundraising agent
   - Voice: Rachel (ElevenLabs)
   - Tools: end_call, skip_turn

2. **Michael - Major Donor Specialist**
   - Professional agent for high-value donors
   - Voice: Adam (ElevenLabs)
   - Tools: end_call, skip_turn, transfer_to_agent
   - **Has transfer rule** configured to transfer to Sarah

3. **Emma - Event Coordinator**
   - Enthusiastic event fundraising agent
   - Voice: Elli (ElevenLabs)
   - Tools: end_call, skip_turn, voicemail_detection

### Campaigns (3)

1. **Annual Fund Drive 2025**
   - Agent: Sarah
   - Budget: $50,000
   - Status: Draft
   - Linked to Demo Donor Prospects list

2. **Major Gifts Initiative**
   - Agent: Michael
   - Budget: $250,000
   - Status: Draft

3. **Spring Gala 2025 - Invitations**
   - Agent: Emma
   - Budget: $15,000
   - Status: Draft

### Leads (5)

- **Demo Donor Prospects** list with sample contacts:
  1. John Smith - New
  2. Jane Doe - New
  3. Robert Johnson - New
  4. Maria Garcia - Contacted
  5. David Williams - Qualified

## Re-seeding the Database

To reset and re-seed the database at any time:

```bash
pnpm supabase:reset
```

**Note**: This will **delete all existing data** in your local database and recreate everything from scratch.

## Customizing Seed Data

To modify the test data, edit `/Users/cyrus/henk/henk/apps/web/supabase/seed.sql`

The seed file is well-commented and organized into sections:

1. Create Test User (with auth credentials)
2. Create Account
3. Create Business
4. Create Agents
5. Create Lead Lists & Leads
6. Create Campaigns

After editing, run `pnpm supabase:reset` to apply your changes.

## Database Management

### View Database Schema

```bash
# Open Supabase Studio in browser
pnpm supabase:status  # Get the Studio URL
```

Or connect directly via psql:

```bash
psql postgresql://postgres:postgres@localhost:54322/postgres
```

### Generate TypeScript Types

After modifying the database schema:

```bash
pnpm supabase:typegen
```

This updates both:

- `packages/supabase/src/database.types.ts`
- `apps/web/lib/database.types.ts`

### View Supabase Logs

```bash
pnpm supabase:logs
```

## Common Issues

### "User not associated with any business" error

This means the seed didn't run or the user wasn't created properly. Solution:

```bash
pnpm supabase:reset
```

### Database connection errors

Make sure Supabase is running:

```bash
pnpm supabase:status
```

If not running, start it:

```bash
pnpm supabase:start
```

### Port conflicts

If ports 54321 or 54322 are in use, stop Supabase and restart:

```bash
pnpm supabase:stop
pnpm supabase:start
```

## Development Workflow

### Typical Workflow

1. Start Supabase: `pnpm supabase:start`
2. Start dev server: `pnpm dev`
3. Make changes to code
4. Hot reload automatically updates the browser
5. Make database changes via migrations (not manually)

### Creating Database Migrations

```bash
# Create a new migration file
supabase migration new my_migration_name

# Edit the file in apps/web/supabase/migrations/
# Then apply it
pnpm supabase:reset
```

### Testing

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Build (to verify production build works)
pnpm build
```

## Environment Variables

The project uses environment-specific configs:

- `.env.local` - Local development (gitignored) ⚠️ **Never commit**
- `.env.test` - Test environment (gitignored)
- `.env.sample` - Template for required variables

Copy `.env.sample` to `.env.local` and fill in your values:

```bash
cp apps/web/.env.sample apps/web/.env.local
```

## Stopping Development

```bash
# Stop the dev server: Ctrl+C in the terminal

# Stop Supabase
pnpm supabase:stop
```

## Production Deployment

**⚠️ WARNING**: Never use the seed script in production!

The seed script is **only** for local development. For production deployment:

```bash
# Set project ref
export SUPABASE_PROJECT_REF=your-project-ref

# Deploy migrations (without seed)
pnpm supabase:deploy:safe
```

---

## Quick Reference

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `pnpm install`          | Install all dependencies      |
| `pnpm dev`              | Start development server      |
| `pnpm supabase:start`   | Start local Supabase          |
| `pnpm supabase:stop`    | Stop local Supabase           |
| `pnpm supabase:reset`   | **Reset DB & seed data**      |
| `pnpm supabase:status`  | View Supabase connection info |
| `pnpm supabase:typegen` | Generate TypeScript types     |
| `pnpm typecheck`        | Run TypeScript checks         |
| `pnpm lint`             | Run ESLint                    |
| `pnpm build`            | Build for production          |

## Need Help?

- Check the [main README](/README.md) for project overview
- See [CLAUDE.md](/CLAUDE.md) for code guidelines
- View [docs/](/docs/) for additional documentation
- File issues at: https://github.com/yourusername/henk/issues
