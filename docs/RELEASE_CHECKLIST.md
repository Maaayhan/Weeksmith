# Release Checklist - Milestone 1 (Tasks A-1 to A-7)

This checklist ensures the codebase is ready for user testing.

## Pre-Release Review

### Code Quality
- [x] All TypeScript type checks pass (`pnpm typecheck`)
- [x] All lint checks pass (`pnpm lint`)
- [x] All unit tests pass (`pnpm test`)
- [x] No critical linter errors
- [x] Code follows project conventions

### Functionality

#### A-1: Kanban Scaffolding
- [x] Kanban board structure exists
- [x] Issue templates available
- [x] Coverage tracking documented

#### A-2: CI Setup
- [x] GitHub Actions workflow configured
- [x] CI runs on pull requests
- [x] Commitlint configured

#### A-3: Data Model
- [x] Database migrations exist and are tested
- [x] Schema matches PRD requirements
- [x] RLS policies enabled
- [x] Constraints enforced (1+1 goals, 6/6 lock)

#### A-4: Auth & Security
- [x] Supabase auth integrated
- [x] Magic link sign-in works
- [x] RLS policies tested
- [x] Audit logging functional
- [x] Correlation IDs implemented
- [x] Protected routes secured

#### A-5: Vision Flow
- [x] Vision form functional
- [x] Multi-level vision capture (Daily/Weekly/Year/Life)
- [x] Tags support (max 12)
- [x] Alignment detection works
- [x] Vision persistence verified
- [x] WCAG 2.2 AA compliance documented

#### A-6: Plan Builder
- [x] 1+1 goal constraint enforced
- [x] Input-only validation works
- [x] KPI detection and rewrite suggestions
- [x] 12-week grid functional
- [x] W7-W12 lock enforcement (client + server)
- [x] Copy-to-week feature works
- [x] Audit logging for plan changes

#### A-7: This Week Views
- [x] Time-blocking mode works
- [x] Priority queue mode works
- [x] Mode switching persists
- [x] Completion gauge calculates correctly
- [x] 85% target zone highlighting works (85-90% optimal range)
- [x] Guidance messages display correctly
- [x] Obstacle logging functional
- [x] Progress saving works
- [x] Lock messaging for W7-W12

### Integration Testing

#### Authentication Flow
- [x] Sign in with magic link works
- [x] Session persists across page reloads
- [x] Sign out works
- [x] Protected routes redirect to login
- [x] Redirect after login works

#### Data Flow
- [x] Vision saves and loads correctly
- [x] Plan creates and updates correctly
- [x] Weekly progress saves correctly
- [x] Obstacles log correctly
- [x] Audit logs capture changes

#### Cross-Feature Integration
- [x] Vision tags appear in alignment chips
- [x] Plan items show in dashboard
- [x] Lock state consistent across pages
- [x] Cycle creation automatic
- [x] Week numbers calculate correctly

### Security

- [x] RLS policies prevent cross-user access
- [x] Audit logs capture all changes
- [x] Correlation IDs present in requests
- [x] No sensitive data in client logs
- [x] Environment variables not exposed
- [x] Open redirect prevention in auth callback

### Documentation

- [x] User guide created (`docs/USER_GUIDE.md`)
- [x] Setup guide created (`docs/SETUP.md`)
- [x] Release checklist created (this file)
- [x] PRD available for reference
- [x] ADRs documented
- [x] Schema documentation available

### Known Limitations

#### Not Yet Implemented (Future Tasks)
- [ ] A-8: AI WAM Chat (not in scope for this milestone)
- [ ] A-9: Export Templates (not in scope)
- [ ] A-10: Notifications (not in scope)
- [ ] A-11: Retro Cycle (not in scope)
- [ ] A-12: Accessibility Pass (partial - Vision flow documented)
- [ ] A-13: Security Privacy Pass (baseline done, full pass pending)
- [ ] A-14: Metrics Events (not in scope)

#### Current Workarounds
- TypeScript type issues with Supabase updates handled with `@ts-ignore` comments
- No `.env.example` file (blocked by gitignore) - documented in SETUP.md instead

### Testing Scenarios

#### Happy Path
1. [x] User signs in
2. [x] User creates vision
3. [x] User creates 12-week plan
4. [x] User tracks Week 1 progress
5. [x] User logs obstacles
6. [x] User views completion gauge

#### Edge Cases
- [x] User tries to create 2 personal goals (blocked)
- [x] User tries to use KPI language (blocked with rewrite suggestion)
- [x] User tries to modify Week 8 quota (blocked)
- [x] User tries to access without auth (redirected)
- [x] User adds >12 tags (blocked)

### Performance

- [x] Page loads in reasonable time
- [x] Form submissions responsive
- [x] No obvious memory leaks
- [x] Database queries optimized (indexes present)

### Browser Compatibility

Tested on:
- [x] Chrome (latest)
- [x] Firefox (latest)
- [x] Safari (latest)
- [ ] Edge (not tested, should work)
- [ ] Mobile browsers (not tested, responsive design present)

## Deployment Readiness

### Environment Setup
- [x] Environment variables documented
- [x] Supabase project setup documented
- [x] Migration process documented
- [x] Seed data available (optional)

### Production Considerations
- [x] Build succeeds (`pnpm build`)
- [x] No hardcoded secrets
- [x] Error handling in place
- [x] Logging configured
- [ ] Monitoring setup (future)
- [ ] Analytics setup (future)

## Post-Release

### Monitoring
- [ ] Set up error tracking
- [ ] Monitor audit logs
- [ ] Track user sign-ups
- [ ] Monitor completion rates

### Feedback Collection
- [ ] User feedback form (future)
- [ ] Support channel (future)
- [ ] Issue tracker ready

## Sign-Off

- [ ] Code Review: _______________
- [ ] QA Review: _______________
- [ ] Security Review: _______________
- [ ] Product Review: _______________

## Release Notes Template

```markdown
# Weeksmith Milestone 1 Release

## What's New

- ✅ Vision Navigator: Define your ideal day, week, year, and life
- ✅ 12-Week Plan Builder: Create structured execution plans with 1+1 goals
- ✅ This Week Dashboard: Track progress with time-blocking or priority queue
- ✅ Completion Gauge: Visual feedback targeting 85% completion (85-90% optimal range)
- ✅ Obstacle Logging: Capture friction for future analysis

## Core Features

### Vision
- Multi-level vision capture (Daily/Weekly/Year/Life)
- Tag-based alignment detection
- Visual preview

### Planning
- 1+1 goal constraint (Personal + Professional)
- Input-only validation (no KPIs)
- 6/6 lock rule (Weeks 1-6 adjustable, 7-12 locked)

### Execution
- Dual workflow modes (Time-blocking / Priority Queue)
- Real-time completion tracking
- Obstacle categorization

## Known Limitations

- AI WAM Chat coming in next milestone
- Export templates coming soon
- Notifications pending
- Retro cycle analysis pending

## Getting Started

See [User Guide](docs/USER_GUIDE.md) for detailed instructions.

## Feedback

We'd love your feedback! Please report issues or suggestions.
```

---

**Status**: ✅ Ready for User Testing
**Date**: 2025-12-03
**Version**: Milestone 1 (Tasks A-1 to A-7)

