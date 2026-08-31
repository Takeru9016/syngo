# Syngo Rebuild — Phase 1: Auth/Pairing Design

Status: approved
Date: 2026-08-30

**Parent spec:** `docs/superpowers/specs/2026-08-26-syngo-rebuild-design.md` (Phase 0 — merged, PR #19). This is the "short design pass" that spec promises for each phase from Phase 1 onward.

## Goal

Migrate the onboarding and pairing screens off Tamagui onto Unistyles, establishing the real color system (8 user-selectable accent schemes × light/dark) and the `src/features/` folder convention on real code for the first time. First proof that the Phase 0 foundation (Unistyles install, theme scaffolding, motion primitives, architecture doc) actually holds up against a real screen.

## Scope

**Screens:** `app/onboarding.tsx`, `app/pair.tsx` — the only two screens shown before a user is paired.

**Out of scope:** any other screen (Phase 2+), backend/Firestore changes, the iOS widget, final visual polish beyond the palette locked in this doc (spacing/motion refinement can continue in later phases if needed).

## Design decisions

### 1. Color system: 16 named Unistyles themes, manually switched

The app already supports 8 user-selectable accent schemes (`coral`, `rose`, `plum`, `lavender`, `mocha`, `ocean`, `sunset`, `sky`) via `useThemeStore` (`src/state/theme.ts`, unchanged by this phase) crossed with light/dark mode — 16 combinations today, implemented as 16 Tamagui themes named `${colorScheme}_${mode}` (see `app/onboarding.tsx`'s existing `` `${colorScheme}_${effectiveMode}` `` pattern).

Phase 0 registered Unistyles with `adaptiveThemes: true` (OS-driven light/dark only, no accent concept) — this must change. Phase 1 replaces it with:

- 16 named Unistyles themes, keeping the same `${colorScheme}_${mode}` naming convention as the Tamagui themes they replace (e.g. `coral_light`, `coral_dark`).
- Generated from 2 **structural bases** (light, dark — background/surface/text/textMuted, unaffected by accent choice) × 8 **accent overlays** (primary/primarySoft/accent per scheme, same across light and dark — matches the current pattern where `terracotta` is identical in both Tamagui themes). A small generator function combines them; no hand-written 16-theme file.
- `adaptiveThemes` dropped. One shared hook/effect (lives in `src/theme/`, consumed by both screens, replacing each screen's local `` `${colorScheme}_${effectiveMode}` `` + `<Theme name={...}>` computation) subscribes to `useThemeStore` and RN's `Appearance`, resolves `mode: "system"`, and calls `UnistylesRuntime.setTheme()`. This centralizes logic that Tamagui's per-screen `<Theme name={activeTheme}>` wrapper duplicated.

### 2. Palette: "Muted Blush"

Chosen over two other warm directions (Soft Terracotta — Phase 0's placeholder, extended; Rich Amber — deeper/more saturated) via visual review.

**Structural — light:** background `#FBF1EC` · surface `#FFFFFF` · text `#3A2A28` · textMuted `#9C8580`
**Structural — dark:** background `#201716` · surface `#2C201F` · text `#F2E4E0` · textMuted `#B8A19C`

**8 accent overlays** (same value in light and dark, per the pattern above):

| Scheme | Primary |
|---|---|
| coral | `#E3A08F` |
| rose | `#E8AEB8` |
| plum | `#B79BB0` |
| lavender | `#B8AAD6` |
| mocha | `#A6897A` |
| ocean | `#86A8B8` |
| sunset | `#E8B892` |
| sky | `#9BC0D2` |

`primarySoft` per scheme: a lighter tint of the primary (mirrors Phase 0's `terracotta`/`terracottaSoft` pattern) — exact tint values are an implementation detail for the plan, not re-litigated here.

Semantic colors (`success`, `warning`, `error`) stay as Phase 0 defined them — accent-independent, unchanged by this phase.

Typography (`Playfair Display` for emotional/heading text, `Inter` for UI text) and spacing/radius tokens are unchanged from Phase 0 — this phase only extends `color`, it doesn't touch the rest of `tokens.ts`'s structure.

### 3. Folder structure: `src/features/pairing/`

Per `docs/ARCHITECTURE.md`, migrated feature-by-feature — this is the first feature. Files that are genuinely pairing-specific (verified via grep — nothing else imports them) move in:

- `src/store/pairing.ts` → `src/features/pairing/store.ts`
- `src/services/pairing/pairing.service.ts` → `src/features/pairing/service.ts`
- `src/components/PairingModal/CodeInput.tsx`, `Countdown.tsx` → `src/features/pairing/components/`
- New: `src/features/pairing/index.ts` — the only import path from `app/`

**Stays put (shared, not pairing-specific):**
- `ScreenContainer` (`src/components/common/` per Phase 0's architecture doc example) — used app-wide.
- `src/services/profile/profile.service.ts` (`subscribeToProfile`, `updateUserProfile`) — consumed by settings, `_layout.tsx`, and pairing. Not migrated in this phase (pre-existing code migrates incrementally, per `docs/ARCHITECTURE.md`); pairing keeps importing it as-is.
- `src/state/theme.ts`, `src/state/haptics.ts`, `src/store/auth.ts` — cross-cutting app state, not feature-specific.

`app/onboarding.tsx` and `app/pair.tsx` stay where expo-router requires them, but become thin route files that import from `src/features/pairing`'s public surface (onboarding's "get started" logic is arguably pairing-adjacent rather than its own feature — folded into `src/features/pairing` rather than given its own feature folder, since it's a single screen with no dedicated store/service of its own).

### 4. Tamagui removal, full

Both screens drop Tamagui entirely — `YStack`/`XStack`/`Stack`/`Text`/`Paragraph`/`Button`/`Switch`/`Spinner`/`Theme` (Tamagui) → RN primitives (`View`/`Text`/`Pressable`/`TextInput` as needed) styled via Unistyles `StyleSheet.create(theme => ...)`. Matches the locked decision that Tamagui is being replaced screen-by-screen, not layered under Unistyles.

Root `TamaguiProvider`/`Theme` wrapping in `app/_layout.tsx` is untouched — it still serves every other (not-yet-migrated) screen. Phase 0 already established Tamagui/Unistyles coexistence; this phase doesn't change that arrangement, just removes Tamagui usage from these two specific screens.

Motion: replace ad-hoc `pressStyle={{ opacity, scale }}` (Tamagui's built-in press feedback) with Phase 0's `src/lib/motion.ts` spring primitives + Reanimated, per the locked "deliberate micro-interactions" design direction.

### 5. Testing

RNTL coverage on the pairing feature's logic — code entry validation (`formatCode`/`unformatCode`/`isValidCodeFormat`, already tested in Phase 0), pairing state transitions in the new `src/features/pairing/store.ts`. Follows Phase 0's Jest/jest-expo setup; no new test infra needed.

## Out of scope for this phase

- Any screen other than onboarding/pair
- Reconciling `src/state/theme.ts`'s shape (it's already exactly `{mode, colorScheme}` — no change needed)
- Migrating `profile` into a feature folder
- Backend/Firestore changes
- iOS widget

## Success criteria

- `pnpm run lint && pnpm run typecheck && pnpm test` all pass locally and in CI on a fresh clone of the `rebuild/01-auth-pairing` branch.
- `app/onboarding.tsx` and `app/pair.tsx` render via Unistyles only — no Tamagui import in either file or in `src/features/pairing/`.
- All 8 accent schemes are selectable and visibly change the pairing/onboarding screens in both light and dark mode.
- `src/features/pairing/` exists per `docs/ARCHITECTURE.md`'s convention; nothing outside it imports pairing internals directly.
