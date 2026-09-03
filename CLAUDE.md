# Syngo — Project Instructions

React Native (Expo) couples app. Firebase backend (Functions v2, Firestore).

## Stack
- Expo + React Native, TypeScript (strict), pnpm
- Tamagui (primary, still used by most screens) + Unistyles (adopted by `app/onboarding.tsx`, `app/pair.tsx`, and `src/features/pairing/`; both coexist)
- Firebase: Functions (TS), Firestore, Firestore rules
- Testing: Jest + jest-expo + React Native Testing Library (`pnpm test`)
- CI: `.github/workflows/ci.yml` — lint + typecheck + test on PRs to `main`

## Active Work: Rebuild

Spec: `docs/superpowers/specs/2026-08-26-syngo-rebuild-design.md`

1. **Phase 0 Foundation — DONE**, merged to `main` (PR #19, 2026-08-30). Delivered: Jest/RNTL infra, `docs/ARCHITECTURE.md`, Unistyles installed + wired (Babel plugin only — v3 has no Metro integration), placeholder `src/theme/` (tokens/themes/breakpoints, `StyleSheet.configure`d), `src/lib/motion.ts` (spring/haptic primitives), pnpm-based CI gate. No screen UI touched.
2. **Phase 1 (Auth/Pairing) — DONE**, merged to `main` 2026-09-03. Spec: `docs/superpowers/specs/2026-08-30-syngo-rebuild-phase1-auth-pairing-design.md`. Plan: `docs/superpowers/plans/2026-08-30-syngo-rebuild-phase1-auth-pairing.md`. Delivered: 16-theme Muted Blush color system (`src/theme/`, 8 accent schemes × light/dark), `useThemeSync` hook bridging `useThemeStore`→`UnistylesRuntime`, `src/features/pairing/` established as the first feature-first folder (store/service relocated, `CodeInput`/`Countdown` rewritten on Unistyles), `app/onboarding.tsx` and `app/pair.tsx` fully migrated off Tamagui. `app/_layout.tsx` now imports `@/theme` so the theme registers at real app startup (was a Phase 0-deferred gap the plan's tasks didn't cover — caught and fixed in final review, not by a task). Added `onPrimary` theme token (WCAG-AA-verified against all 8 accents) and a live-ticking `codeExpired` check on the pairing screen, both plan-inherited bugs fixed post-implementation. **Known follow-up, not yet done:** `babel.config.js`'s Unistyles plugin (`autoProcessPaths: { root: "src" }`) still excludes `app/`, so a live in-session theme switch may not instantly repaint `app/onboarding.tsx`/`app/pair.tsx` until the next navigation — needs a real-device check and a Babel config change with its own review.
3. **Phase 2+** — not yet planned.

4. **Backend Notification Dedupe** — plan: `docs/superpowers/plans/2026-08-26-syngo-rebuild-backend-notification-dedupe.md`
   - Branch `rebuild/backend-notification-dedupe` — **not yet created**.
   - Goal: extract shared `notifyPartner()` helper, dedupe 6 Cloud Functions triggers. No payload/schema changes allowed.
   - Independent of the frontend rebuild, can run in parallel.

## Conventions
- Functional components only, named exports, TypeScript strict.
- `functions/` has its own package.json/tsconfig — deps for backend work go there, not root.
