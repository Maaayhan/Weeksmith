# Weeksmith Setup Guide

This guide helps developers set up the Weeksmith project for local development and testing.

## Prerequisites

- Node.js 20+ 
- pnpm 9.7.0+
- Supabase account (free tier works)
- Git

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd Weeksmith
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Get your project URL and API keys from Settings → API
3. Copy `.env.example` to `.env.local` (if it exists) or create `.env.local`:

```bash
# In apps/web directory
cd apps/web
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EOF
```

### 4. Run Database Migrations

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Link to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

   Or manually apply the migration:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/202510041230_core_schema.sql`
   - Run the SQL

4. (Optional) Seed sample data:
   - Copy contents of `supabase/seeds/202510041235_sample_data.sql`
   - Run in SQL Editor

### 5. Start Development Server

```bash
# From project root
pnpm dev
```

Visit http://localhost:3000

## Project Structure

```
Weeksmith/
├── apps/
│   └── web/              # Next.js application
│       ├── app/          # App Router pages
│       ├── actions/      # Server Actions
│       ├── components/   # React components
│       └── lib/          # Utilities
├── packages/
│   └── schemas/          # Shared Zod schemas
├── supabase/
│   ├── migrations/       # Database migrations
│   ├── seeds/            # Seed data
│   └── tests/            # Database tests
├── docs/                 # Documentation
└── kanban/               # Project management
```

## Available Scripts

### Root Level

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm typecheck` - Type check TypeScript

### Web App

- `pnpm --filter web dev` - Start web dev server
- `pnpm --filter web build` - Build web app
- `pnpm --filter web typecheck` - Type check web app

## Environment Variables

Required environment variables (in `apps/web/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Security Note**: Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

## Database Schema

The core schema includes:

- `vision` - User vision statements
- `cycle` - 12-week cycles
- `goal` - Personal/professional goals (1+1 constraint)
- `weekly_plan` - Weekly execution plans
- `plan_item` - Weekly quota items
- `audit_log` - Change audit trail
- `chat_session` / `chat_message` - AI WAM sessions (future)

See `docs/schema/overview.md` for details.

## Testing

Run all tests:
```bash
pnpm test
```

Run specific test file:
```bash
pnpm test apps/web/lib/week/metrics.test.ts
```

## Type Checking

Check TypeScript types:
```bash
pnpm typecheck
```

## Linting

Lint code:
```bash
pnpm lint
```

## Common Issues

### "Cannot find module '@weeksmith/schemas'"

Run `pnpm install` from project root to link workspace packages.

### "Supabase client initialization failed"

Check that `.env.local` exists and has correct values. Restart dev server after adding env vars.

### "RLS policy violation"

Ensure you're signed in and using the correct Supabase client (server vs client).

### "Migration failed"

Check Supabase project status and ensure you have proper permissions. Review migration SQL for syntax errors.

## CI/CD

The project uses GitHub Actions for CI:
- Lint check
- Type check  
- Unit tests
- Build verification

See `.github/workflows/ci.yml` for details.

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Build

```bash
pnpm build
pnpm --filter web start
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Run tests: `pnpm test`
4. Type check: `pnpm typecheck`
5. Lint: `pnpm lint`
6. Commit with conventional commits: `git commit -m "feat: add feature"`
7. Push and create PR

## Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Conventional Commits format
- Prefer Server Actions over API routes
- Use Zod for validation

## Resources

- [PRD](./PRD.md) - Product requirements
- [User Guide](./USER_GUIDE.md) - End-user documentation
- [Security Baseline](./security/baseline.md) - Security practices
- [Schema Overview](./schema/overview.md) - Database schema docs

