# Weeksmith

**Six-Month Transformer** — A methodology-driven personal growth app based on Zach Highley's 12-week transformation framework.

## Overview

Weeksmith helps you transform your life in 6 months through structured 12-week cycles, focusing on:
- **1+1 Goals**: One personal + one professional goal per cycle
- **Input-Only Actions**: Focus on what you control, not outcomes
- **6/6 Lock Rule**: Adjustable Weeks 1-6, locked Weeks 7-12
- **85% Sweet Spot**: Target 80-90% completion for optimal learning

## Current Status

**Milestone 1 Complete** ✅ (Tasks A-1 to A-7)

### Implemented Features
- ✅ Vision Navigator (Daily/Weekly/Year/Life)
- ✅ 12-Week Plan Builder with 1+1 constraint
- ✅ This Week Dashboard (Time-blocking & Priority Queue)
- ✅ Completion Gauge (80-90% zone tracking)
- ✅ Obstacle Logging
- ✅ Authentication & Security (RLS, Audit Logging)

### Coming Soon
- 🔜 AI WAM Chat (A-8)
- 🔜 Export Templates (A-9)
- 🔜 Notifications (A-10)
- 🔜 Retro Cycle Analysis (A-11)

## Quick Start

### For Users
See [User Guide](docs/USER_GUIDE.md) for complete instructions.

1. Sign in with email (magic link)
2. Complete your Vision
3. Create your 12-Week Plan
4. Track progress in Dashboard

### For Developers
See [Setup Guide](docs/SETUP.md) for development setup.

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Copy .env.example to apps/web/.env.local

# Run database migrations
supabase db push

# Start development server
pnpm dev
```

## Documentation

- [User Guide](docs/USER_GUIDE.md) - End-user documentation
- [Setup Guide](docs/SETUP.md) - Developer setup instructions
- [Release Checklist](docs/RELEASE_CHECKLIST.md) - Milestone 1 checklist
- [PRD](PRD.md) - Product requirements document
- [Security Baseline](docs/security/baseline.md) - Security practices
- [Schema Overview](docs/schema/overview.md) - Database schema

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js Server Actions, Supabase
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (Magic Links)
- **Validation**: Zod
- **Testing**: Vitest
- **CI/CD**: GitHub Actions

## Project Structure

```
Weeksmith/
├── apps/web/           # Next.js application
├── packages/schemas/    # Shared Zod schemas
├── supabase/           # Database migrations & tests
├── docs/               # Documentation
└── kanban/             # Project management
```

## Development

### Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm lint         # Lint code
pnpm typecheck    # Type check
```

### Code Quality

- TypeScript strict mode
- ESLint with Next.js config
- Conventional Commits
- Pre-commit hooks (via CI)

## Testing

Run all tests:
```bash
pnpm test
```

Run specific test:
```bash
pnpm test apps/web/lib/week/metrics.test.ts
```

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following project conventions
3. Run tests and type checks
4. Commit with conventional commits
5. Create pull request

## License

[Add license information]

## Support

For issues or questions:
- Check [User Guide](docs/USER_GUIDE.md)
- Review [PRD](PRD.md) for methodology details
- Check audit logs for change history

---

**Built with ❤️ following Zach Highley's methodology**

