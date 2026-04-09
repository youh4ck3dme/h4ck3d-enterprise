# Googla Builder1s

Production-focused local setup for reliable development on Windows.

## Dedicated terminal (recommended)

1. Run:

```bat
start-codex-terminal.cmd
```

2. This opens a project-scoped PowerShell terminal with:
- fixed working directory in this repository
- strict error handling
- Node/npm version preflight
- ready-to-use helper commands

## Bootstrap environment

Run once after clone, then anytime you want a clean and deterministic setup:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\setup\bootstrap.ps1
```

Optional flags:
- `-SkipInstall` skips `npm ci`
- `-RunChecks` runs `typecheck`, `test`, `build`
- `-RunLint` adds `lint` to checks

## Terminal helper commands

Inside the dedicated terminal:
- `bootstrap` -> run bootstrap script
- `dev` -> start Vite dev server
- `typecheck` -> run TypeScript checks
- `lint` -> run ESLint
- `test` -> run Vitest
- `build` -> run production build
- `qa` -> run `typecheck + lint + test + build`

## Current verification status

Verified locally on 2026-04-09:
- `npm run typecheck` passes
- `npm run test` passes
- `npm run build` passes
- `npm run lint` currently fails in `src/lib/dynamic-syntax.tsx` (existing repo issue, not introduced by this setup)
