# Syngo — Project Instructions

React Native (Expo) couples app. Firebase backend (Functions v2, Firestore).

## Stack
- Expo + React Native, TypeScript, pnpm
- Tamagui (current) → migrating to Unistyles (Phase 0 rebuild)
- Firebase: Functions (TS), Firestore, Firestore rules

## Active Work: Rebuild (2 parallel tracks, both unstarted)

Spec: `docs/superpowers/specs/2026-08-26-syngo-rebuild-design.md`

1. **Phase 0 Foundation** — plan: `docs/superpowers/plans/2026-08-26-syngo-rebuild-phase0-foundation.md`
   - Branch/worktree: `.claude/worktrees/rebuild+00-foundation` (branch `rebuild/00-foundation`)
   - Status: branch created, only holds the spec commit. Task 1 Step 1 ("Install testing dependencies") not started. No jest config, no test script, no Unistyles installed.
   - Run via `superpowers:subagent-driven-development` or `superpowers:executing-plans`, checkbox-tracked.

2. **Backend Notification Dedupe** — plan: `docs/superpowers/plans/2026-08-26-syngo-rebuild-backend-notification-dedupe.md`
   - Branch `rebuild/backend-notification-dedupe` — **not yet created**.
   - Goal: extract shared `notifyPartner()` helper, dedupe 6 Cloud Functions triggers. No payload/schema changes allowed.
   - Independent of Phase 0, can run in parallel.

## Conventions
- Functional components only, named exports, TypeScript strict.
- `functions/` has its own package.json/tsconfig — deps for backend work go there, not root.
