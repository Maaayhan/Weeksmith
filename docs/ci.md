# Continuous Integration Playbook

This repository uses GitHub Actions to enforce the quality gates described in the PRD (§4, §11, §16).

## Workflow Overview

The [`CI` workflow](../.github/workflows/ci.yml) runs on pushes and pull requests targeting `main` or `work`.

Jobs:

1. **Conventional Commits** – Runs [`commitlint`](https://commitlint.js.org/) against the commits in scope using the standard Conventional Commit ruleset. Fails fast if any commit message violates the policy.
2. **Lint** – Installs project dependencies with the detected package manager (pnpm, yarn, or npm) and executes the `lint` npm script.
3. **Type Check** – Executes the `typecheck` npm script (e.g., `tsc --noEmit`).
4. **Unit Tests** – Executes the `test` npm script with `--watch=false` forwarded when supported so jobs exit after a single run.
5. **Preview Build** – Runs the `build` npm script to ensure Vercel-ready production builds succeed.

The build, test, lint, and type-check jobs automatically skip when `package.json` is absent (useful before application scaffolding lands). Each job fails when the expected npm script is missing, preventing silent drift between local scripts and CI.

## Local Command Reference

To mirror CI locally run the matching scripts with your package manager:

```bash
# install dependencies using pnpm/yarn/npm
your-pm install

# run static analysis
your-pm lint
your-pm typecheck

# execute tests (single run)
your-pm test -- --watch=false

# produce a production build
your-pm build
```

Replace `your-pm` with `pnpm`, `yarn`, or `npm run` depending on the workspace lockfile. For pnpm users, enable Corepack (`corepack enable`) before running commands.

## Conventional Commit Policy

Commit messages must follow the `type(scope?): subject` format from Conventional Commits. Example:

```
feat(auth): add RLS policy for profile updates
```

Use this command to lint commits locally before pushing:

```bash
npx --yes -p @commitlint/cli@19 -p @commitlint/config-conventional@19 commitlint --from HEAD~1 --to HEAD
```

Document CI results (pass/fail, run IDs) in the related Kanban issue under **Test Evidence** per workflow guidelines.
