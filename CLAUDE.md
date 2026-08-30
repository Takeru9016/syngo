# Syngo — Project Instructions

React Native (Expo) couples app. Firebase backend (Functions v2, Firestore).

## Stack
- Expo + React Native, TypeScript (strict), pnpm
- Tamagui (current, still primary) + Unistyles (installed Phase 0, not yet adopted by any screen)
- Firebase: Functions (TS), Firestore, Firestore rules
- Testing: Jest + jest-expo + React Native Testing Library (`pnpm test`)
- CI: `.github/workflows/ci.yml` — lint + typecheck + test on PRs to `main`

## Active Work: Rebuild

Spec: `docs/superpowers/specs/2026-08-26-syngo-rebuild-design.md`

1. **Phase 0 Foundation — DONE**, merged to `main` (PR #19, 2026-08-30). Delivered: Jest/RNTL infra, `docs/ARCHITECTURE.md`, Unistyles installed + wired (Babel plugin only — v3 has no Metro integration), placeholder `src/theme/` (tokens/themes/breakpoints, `StyleSheet.configure`d), `src/lib/motion.ts` (spring/haptic primitives), pnpm-based CI gate. No screen UI touched. Deferred to Phase 1 (needs screen-file changes, was out of Phase 0's scope): wiring `src/theme` into `app/_layout.tsx`, reconciling Unistyles' `adaptiveThemes: true` with the existing `useThemeStore` 8-color-scheme system, widening the Babel plugin's `autoProcessPaths` for `app/`.
2. **Phase 1+** — not yet planned. Next planning session picks up here.

3. **Backend Notification Dedupe** — plan: `docs/superpowers/plans/2026-08-26-syngo-rebuild-backend-notification-dedupe.md`
   - Branch `rebuild/backend-notification-dedupe` — **not yet created**.
   - Goal: extract shared `notifyPartner()` helper, dedupe 6 Cloud Functions triggers. No payload/schema changes allowed.
   - Independent of the frontend rebuild, can run in parallel.

## Conventions
- Functional components only, named exports, TypeScript strict.
- `functions/` has its own package.json/tsconfig — deps for backend work go there, not root.
