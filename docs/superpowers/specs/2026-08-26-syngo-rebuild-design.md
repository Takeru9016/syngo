# Syngo Rebuild — Design

Status: approved (Phase 0 design), later phases to be specced individually
Date: 2026-08-26

## Goal

Rebuild Syngo's frontend with better UI/UX, a more personal feel, and
professional-standard code quality (strict TS, tests, consistent
architecture, CI). Backend stays functionally the same, with one small
isolated cleanup. Feature set stays the same minus one unbuilt stub.

## Locked decisions (apply to all phases)

- **Codebase**: same repo (`Takeru9016/syngo`), rebuilt on branches off
  `main`, not a new repo. Firebase project, EAS project ID, App Store
  listing all stay as-is.
- **Backend**: kept as-is functionally. One isolated cleanup — dedupe
  the repeated push + in-app-notification code across the 7
  `onX...` Cloud Functions triggers into a shared helper. No schema
  changes, no rules changes, no client-facing behavior changes.
- **Feature scope**: same 5 features — Todos/Dreams, Mood, Favorites,
  Stickers, Nudges — plus Notifications and iOS home-screen widget.
  The Android widget is dropped: `src/widgets/android` was an empty
  stub with no native implementation, so it's removed rather than
  carried forward as dead scaffolding. Widgets are iOS-only going
  forward.
- **Design direction**: warm & intimate as the base feel (soft warm
  palette, serif accents for personal-note moments), layered with
  deliberate micro-interactions (press feedback, spring transitions,
  haptics-paired motion) rather than being purely quiet/minimal.
- **Stack**: Expo, React Native, expo-router, Zustand, TanStack Query,
  Firebase JS SDK all stay. Tamagui is replaced with **Unistyles**
  (compile-time styles, native theme switching, no runtime style
  overhead) as the styling engine.
- **Quality bar**: strict TypeScript everywhere (no `any`, typed
  Firestore converters), automated tests (Jest + React Native Testing
  Library via `jest-expo`), a written architecture-conventions doc,
  and a CI gate (GitHub Actions: lint + typecheck + test, blocking on
  PRs to `main`).
- **Rollout**: screen-by-screen incremental. Each phase is built on
  its own branch off `main`, PR-reviewed, CI-gated, and merged before
  the next phase starts — not one long-lived branch, not a big-bang
  cutover.

## Phase roadmap

1. **Phase 0 — Foundation** (this spec's detailed scope, below)
2. **Phase 1 — Auth/Pairing** (onboarding + pair screens)
3. **Phase 2 — Home/tabs shell**
4. **Phase 3 — Todos/Dreams**
5. **Phase 4 — Mood**
6. **Phase 5 — Favorites**
7. **Phase 6 — Stickers**
8. **Phase 7 — Nudges**
9. **Phase 8 — Notifications**
10. **Phase 9 — Settings/Profile**
11. **iOS widget** — revisited after Phase 3+ once new data shapes are
    stable enough to feed widget content.
12. **Backend notification-trigger dedupe** — parallel to any UI
    phase, doesn't block them.

Each phase from Phase 1 onward gets its own short design pass before
its implementation plan — this document only specs Phase 0 in detail.

## Phase 0 — Foundation (detailed scope)

### 1. Branch strategy

Per-phase branches off `main`: `rebuild/00-foundation`,
`rebuild/01-auth-pairing`, etc. Each is PR-reviewed and CI-gated
before merge; the next phase branches from the updated `main`.

### 2. Architecture conventions

Written to `docs/ARCHITECTURE.md`. Feature-first folders under
`src/features/<feature>/{components,hooks,service}`, replacing the
current type-first split (`src/components/<Feature>`,
`src/services/<feature>`, `src/hooks/` all separate top-level
directories). No cross-feature imports except through a feature's
`index.ts` public surface. Shared UI stays in `src/components/common`;
shared non-UI logic moves to `src/lib`.

This is a light consolidation, not a rewrite — the current repo
already groups most feature code by name (`services/todo/`,
`components/ToDo/`), it just isn't colocated under one folder per
feature, and hooks/store aren't split out at all.

### 3. Design tokens & theme

Unistyles theme file defining the warm/intimate palette (exact
swatches refined visually in Phase 1, not finalized here), using the
already-bundled fonts: Playfair Display for personal-note/emotional
moments, Inter for UI text. Light/dark handled via Unistyles' native
theme switching, replacing Tamagui's `Theme name={...}` mechanism.

Micro-interaction primitives (press-scale, spring-in/out, haptics-paired
transitions) are centralized in `src/lib/motion.ts`, built on the
existing `react-native-reanimated` + `expo-haptics` dependencies —
no new animation library.

### 4. Navigation shell

Keep expo-router and the existing route groups (`(tabs)`, `pair`,
`onboarding`). Routing structure isn't broken today — only what
renders inside each route changes, phase by phase.

### 5. Testing

`jest-expo` preset + React Native Testing Library. Phase 0 ships the
test config and one smoke test that proves it runs correctly in CI.
Real coverage is added incrementally as each feature phase lands, not
retrofitted onto old code.

### 6. CI

`.github/workflows/ci.yml`, triggered on PRs targeting `main`, running
`eslint`, `tsc --noEmit`, and `jest`. All three block merge on
failure.

### 7. Backend notification-trigger dedupe (parallel track)

New shared helper (`functions/src/utils/notifyOnEvent.ts` or similar)
that factors out the repeated "send push + create in-app notification"
pattern currently duplicated across `onTodoCreated`, `onTodoUpdated`,
`onTodoDeleted`, `onStickerSent`, `onFavoriteAdded`, `onMoodUpdated`,
and `onNotificationCreated`. Each trigger is refactored to call the
helper with its own title/body/type. No behavior change — same
notifications, same payloads, just without the copy-paste.

## Out of scope for Phase 0

- Any actual screen UI (starts Phase 1)
- Final color values / exact palette (visual work starts Phase 1)
- Widget rebuild (deferred to after Phase 3+)
- Any backend schema or rules change

## Success criteria for Phase 0

- `npm run lint && npm run typecheck && npx jest` all pass locally and
  in CI on a fresh clone of the `rebuild/00-foundation` branch.
- `docs/ARCHITECTURE.md` exists and documents the folder/import rules.
- Unistyles is installed and a theme file exists and compiles, even
  with placeholder colors.
- Old Tamagui-based app continues to build and run unmodified until
  its screens are migrated phase by phase (Foundation does not delete
  Tamagui yet — that happens once the last screen depending on it is
  migrated).
- Backend dedupe helper is merged separately, Cloud Functions deploy
  successfully, and existing notification behavior is unchanged
  (verified manually against the current trigger tests / emulator).
