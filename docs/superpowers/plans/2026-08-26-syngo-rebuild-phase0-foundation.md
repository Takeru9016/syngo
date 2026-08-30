# Syngo Rebuild — Phase 0: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the testing, CI, styling-engine, and architecture-convention scaffolding that every later rebuild phase depends on, without touching any screen UI or removing Tamagui yet.

**Architecture:** Add Jest + React Native Testing Library first so every later task in this plan can be TDD'd. Then document the target folder/import conventions. Then install and wire up Unistyles (native module, so it needs a babel/metro/pod-install pass) alongside the existing Tamagui setup — both coexist until Tamagui is phased out screen by screen in later phases. Then define the placeholder warm-palette theme and a small motion-primitives module on Unistyles + the existing Reanimated/Haptics deps. Finish with a GitHub Actions CI gate running the same lint/typecheck/test commands used locally.

**Tech Stack:** Expo SDK 54, React Native 0.81 (new architecture), TypeScript (strict), react-native-unistyles v3, react-native-reanimated, expo-haptics, jest-expo, @testing-library/react-native, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-26-syngo-rebuild-design.md`

## Global Constraints

- Backend (Firestore schema, rules, Cloud Functions behavior) does not change in this plan — that's a separate plan (`2026-08-26-syngo-rebuild-backend-notification-dedupe.md`).
- No screen UI changes in this plan — Phase 1 onward.
- Tamagui is **not removed** in this plan. It keeps running the existing app; Unistyles is added alongside it.
- Every new/changed file must pass `npx tsc --noEmit` in strict mode (already the project default — don't weaken it).
- All new code goes under `src/`, `functions/`, `.github/`, or `docs/` — no new top-level directories outside those.

---

## Task 1: Testing infrastructure

**Files:**
- Create: `jest.config.js`
- Create: `jest.setup.js`
- Modify: `package.json` (add `test` script + devDependencies)
- Test: `src/utils/__tests__/code-generator.test.ts`

**Interfaces:**
- Consumes: existing `src/utils/code-generator.ts` exports — `generateRandomCode(length?: number): string`, `formatCode(code: string): string`, `unformatCode(code: string): string`, `isValidCodeFormat(code: string): boolean`.
- Produces: `npm test` / `npx jest` as the command every later task's tests run under. `jest.config.js` uses the `jest-expo` preset — later test files need no per-file config.

- [ ] **Step 1: Install testing dependencies**

Run: `npm install --save-dev jest jest-expo @testing-library/react-native @types/jest`

Expected: install succeeds, `package.json` devDependencies gains all four packages.

- [ ] **Step 2: Create Jest config**

Create `jest.config.js`:

```js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEach: [],
  setupFiles: ["./jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
};
```

- [ ] **Step 3: Create Jest setup file**

Create `jest.setup.js`:

```js
// Silences noisy Expo/RN warnings that aren't actionable in unit tests.
jest.spyOn(console, "warn").mockImplementation(() => {});
```

- [ ] **Step 4: Add the `test` script**

Modify `package.json` scripts block (currently ends with `"release": "..."`) — add a `test` entry:

```json
    "test": "jest",
```

- [ ] **Step 5: Write the failing test**

Create `src/utils/__tests__/code-generator.test.ts`:

```ts
import {
  generateRandomCode,
  formatCode,
  unformatCode,
  isValidCodeFormat,
} from "../code-generator";

describe("generateRandomCode", () => {
  it("generates a code of the requested length", () => {
    expect(generateRandomCode(6)).toHaveLength(6);
    expect(generateRandomCode(4)).toHaveLength(4);
  });

  it("only uses unambiguous uppercase alphanumeric characters", () => {
    const code = generateRandomCode(6);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/);
  });

  it("never contains a blacklisted substring", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateRandomCode(6);
      expect(code).not.toMatch(/69|420|SEX|FUC|SHI|BIC|DIK|ASS|CUM|TIT|VAG|KYS|NIG|FAG|GAY|JEW|KKK/);
    }
  });
});

describe("formatCode", () => {
  it("inserts a hyphen after the third character for 6-character codes", () => {
    expect(formatCode("AB12CD")).toBe("AB1-2CD");
  });

  it("leaves non-6-character codes unchanged", () => {
    expect(formatCode("AB12")).toBe("AB12");
  });
});

describe("unformatCode", () => {
  it("strips non-alphanumeric characters and uppercases", () => {
    expect(unformatCode("ab1-2cd")).toBe("AB12CD");
  });
});

describe("isValidCodeFormat", () => {
  it("accepts a well-formed 6-character code", () => {
    expect(isValidCodeFormat("AB1-2CD")).toBe(true);
  });

  it("rejects a code with the wrong length", () => {
    expect(isValidCodeFormat("AB1-2C")).toBe(false);
  });

  it("rejects a code with invalid characters", () => {
    expect(isValidCodeFormat("AB1-2C!")).toBe(false);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx jest src/utils/__tests__/code-generator.test.ts`
Expected: FAIL — `Cannot find module '../code-generator'` or similar, because Jest isn't configured to resolve TS paths yet if config is missing. If Step 2–4 are already in place, this may instead PASS immediately since `code-generator.ts` already exists and is correct — in that case skip to Step 7 and treat this as the infra-verification run rather than a red/green cycle (the module under test is pre-existing, not new).

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx jest src/utils/__tests__/code-generator.test.ts`
Expected: PASS, all 9 test cases green.

- [ ] **Step 8: Commit**

```bash
git add jest.config.js jest.setup.js package.json package-lock.json src/utils/__tests__/code-generator.test.ts
git commit -m "test: add Jest + RNTL infrastructure with code-generator coverage"
```

---

## Task 2: Architecture conventions doc

**Files:**
- Create: `docs/ARCHITECTURE.md`

**Interfaces:**
- Consumes: nothing (documentation only).
- Produces: the folder/import rules every later phase's file-structure sections reference by name (`src/features/<feature>/`, `src/lib/`, `src/components/common/`).

- [ ] **Step 1: Write the doc**

Create `docs/ARCHITECTURE.md`:

```markdown
# Syngo Architecture Conventions

These rules apply to all code written during the rebuild (Phase 0 onward).
Pre-existing code under `src/components/`, `src/services/`, `src/hooks/`,
`src/store/` is migrated into this structure feature by feature, not all
at once.

## Folder structure

    src/
      features/
        <feature>/
          components/   # UI local to this feature
          hooks/         # React hooks local to this feature
          service.ts     # Firestore/network calls for this feature
          store.ts       # Zustand store for this feature, if it has one
          types.ts       # Types local to this feature
          index.ts       # Public surface — only this file is imported
                         # from outside the feature
      components/
        common/          # Shared, feature-agnostic UI (buttons, cards,
                         # loading/error states)
      lib/                # Shared non-UI logic (motion primitives, date
                         # helpers, code generators, Firestore converters)
      theme/              # Unistyles tokens, themes, breakpoints
      config/             # Firebase init, fonts, app-wide config
      types/               # Cross-feature shared types only

## Import rules

- A feature's internals (`components/`, `hooks/`, `service.ts`, etc.) are
  never imported directly from another feature or from `app/`. Only
  `src/features/<feature>/index.ts` is a valid import path from outside
  the feature.
- `src/lib` and `src/components/common` may be imported from anywhere.
- `app/` (expo-router routes) may import from any feature's `index.ts`
  and from `src/lib`, `src/components/common`, `src/theme`, `src/config`.
- No feature imports another feature's internals to "borrow" a component
  or hook. If two features need the same thing, it belongs in
  `src/lib` or `src/components/common`.

## Rationale

This exists so a reviewer can look at an import path and immediately know
whether it's crossing a feature boundary it shouldn't. It also means a
feature can be deleted or rewritten by deleting/rewriting one folder,
without hunting for scattered files across `components/`, `services/`,
and `hooks/`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: add architecture conventions for the rebuild"
```

---

## Task 3: Install and wire up Unistyles

**Files:**
- Modify: `package.json` (dependencies)
- Modify: `babel.config.js`
- Modify: `metro.config.js`
- Create: `src/theme/unistyles.d.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: the `react-native-unistyles` package available for import, with Babel/Metro configured to compile styles. Task 4 depends on this being in place before it can define themes.

- [ ] **Step 1: Install Unistyles and its required native dependencies**

Run: `npx expo install react-native-unistyles react-native-edge-to-edge react-native-nitro-modules`

Expected: install succeeds. These are native modules — the project uses a prebuilt `ios/`/`android/` workflow (not managed), so native linking needs the pod-install step below.

- [ ] **Step 2: Install iOS pods**

Run: `cd ios && pod install && cd ..`
Expected: pods install cleanly, including `RNUnistyles` / `NitroModules` pod targets.

- [ ] **Step 3: Add the Unistyles Babel plugin**

Modify `babel.config.js` — Reanimated's plugin must stay last, so Unistyles' plugin goes before it:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["react-native-unistyles/plugin", { root: "src" }],
      "react-native-reanimated/plugin",
    ],
  };
};
```

- [ ] **Step 4: Wrap Metro config with Unistyles**

Modify `metro.config.js`:

```js
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withUnistyles } = require("react-native-unistyles/metro");

const config = getSentryExpoConfig(__dirname);

module.exports = withUnistyles(config, { root: "src" });
```

- [ ] **Step 5: Add TypeScript module augmentation stub**

Create `src/theme/unistyles.d.ts` (populated with real theme/breakpoint types in Task 4 — this step only establishes the file so `tsc` has a declaration target):

```ts
import "react-native-unistyles";

declare module "react-native-unistyles" {
  export interface UnistylesThemes {}
  export interface UnistylesBreakpoints {}
}
```

- [ ] **Step 6: Verify the app still builds and runs**

Run: `npx expo run:ios`
Expected: app builds and launches to the existing Tamagui-rendered UI with no red-screen error. This confirms Unistyles' native module and Babel/Metro plugins don't break the existing build — Unistyles isn't rendering anything yet.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json babel.config.js metro.config.js src/theme/unistyles.d.ts ios/Podfile.lock
git commit -m "build: install and wire up react-native-unistyles"
```

---

## Task 4: Theme tokens, themes, and breakpoints

**Files:**
- Create: `src/theme/tokens.ts`
- Create: `src/theme/breakpoints.ts`
- Create: `src/theme/themes.ts`
- Create: `src/theme/index.ts`
- Modify: `src/theme/unistyles.d.ts`
- Test: `src/theme/__tests__/themes.test.tsx`

**Interfaces:**
- Consumes: `UnistylesRegistry` from `react-native-unistyles` (Task 3).
- Produces: `lightTheme`, `darkTheme` (exported from `src/theme/themes.ts`), registered under theme names `"light"` and `"dark"` — later phases style screens with `StyleSheet.create(theme => ({ ... }))` from `react-native-unistyles` using these theme keys. `tokens` (exported from `src/theme/tokens.ts`) is the placeholder warm-palette color/spacing/radius scale later phases read from when building screen-specific styles.

- [ ] **Step 1: Define placeholder color/spacing tokens**

Create `src/theme/tokens.ts`:

```ts
// Placeholder warm/intimate palette — exact values finalized visually in
// Phase 1, not here. Structure (the token names) is what later phases
// depend on, not these specific hex values.
export const tokens = {
  color: {
    warmBg: "#FFF7F0",
    warmBgDark: "#1E1611",
    surface: "#FFFFFF",
    surfaceDark: "#2A211B",
    ink: "#2B1D14",
    inkDark: "#F5E9DD",
    inkMuted: "#8A7566",
    inkMutedDark: "#B8A48F",
    terracotta: "#D97757",
    terracottaSoft: "#F4C9B4",
    olive: "#6B7A4F",
    success: "#4BAF79",
    warning: "#F1B04D",
    error: "#E15454",
  },
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    pill: 999,
  },
} as const;
```

- [ ] **Step 2: Define breakpoints**

Create `src/theme/breakpoints.ts`:

```ts
// Syngo is portrait-only phone app (ios.supportsTablet: false in
// app.config.ts) — one breakpoint is enough, this exists because
// Unistyles requires at least one to be registered.
export const breakpoints = {
  xs: 0,
} as const;
```

- [ ] **Step 3: Define light/dark themes from tokens**

Create `src/theme/themes.ts`:

```ts
import { tokens } from "./tokens";

export const lightTheme = {
  colors: {
    background: tokens.color.warmBg,
    surface: tokens.color.surface,
    text: tokens.color.ink,
    textMuted: tokens.color.inkMuted,
    primary: tokens.color.terracotta,
    primarySoft: tokens.color.terracottaSoft,
    accent: tokens.color.olive,
    success: tokens.color.success,
    warning: tokens.color.warning,
    error: tokens.color.error,
  },
  space: tokens.space,
  radius: tokens.radius,
};

export const darkTheme = {
  colors: {
    background: tokens.color.warmBgDark,
    surface: tokens.color.surfaceDark,
    text: tokens.color.inkDark,
    textMuted: tokens.color.inkMutedDark,
    primary: tokens.color.terracotta,
    primarySoft: tokens.color.terracottaSoft,
    accent: tokens.color.olive,
    success: tokens.color.success,
    warning: tokens.color.warning,
    error: tokens.color.error,
  },
  space: tokens.space,
  radius: tokens.radius,
};

export type AppTheme = typeof lightTheme;
```

- [ ] **Step 4: Register themes and breakpoints with Unistyles**

Create `src/theme/index.ts`:

```ts
import { UnistylesRegistry } from "react-native-unistyles";
import { breakpoints } from "./breakpoints";
import { lightTheme, darkTheme } from "./themes";

UnistylesRegistry.addBreakpoints(breakpoints).addThemes({
  light: lightTheme,
  dark: darkTheme,
}).addConfig({
  adaptiveThemes: true,
});
```

- [ ] **Step 5: Complete the TypeScript module augmentation**

Modify `src/theme/unistyles.d.ts`:

```ts
import "react-native-unistyles";
import type { lightTheme } from "./themes";
import type { breakpoints } from "./breakpoints";

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof lightTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints
    extends Record<keyof typeof breakpoints, number> {}
}
```

- [ ] **Step 6: Write the failing test**

Create `src/theme/__tests__/themes.test.tsx`:

```tsx
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import "../index"; // registers themes/breakpoints as a side effect

const styles = StyleSheet.create((theme) => ({
  label: {
    color: theme.colors.primary,
  },
}));

function Probe() {
  return <Text style={styles.label}>hello</Text>;
}

describe("Unistyles theme registration", () => {
  it("resolves a themed style without throwing", () => {
    render(<Probe />);
    expect(screen.getByText("hello")).toBeTruthy();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx jest src/theme/__tests__/themes.test.tsx`
Expected: FAIL before Steps 1–5 exist, or PASS immediately if they're already in place (same pre-existing-module caveat as Task 1 Step 6) — since this test is written after the implementation steps in this task, it should go straight to PASS. If it fails, the error will point at whichever of `tokens.ts` / `breakpoints.ts` / `themes.ts` / `index.ts` / `unistyles.d.ts` is missing or mistyped.

- [ ] **Step 8: Run test to verify it passes**

Run: `npx jest src/theme/__tests__/themes.test.tsx`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/theme
git commit -m "feat: add Unistyles theme tokens, light/dark themes, breakpoints"
```

---

## Task 5: Motion primitives

**Files:**
- Create: `src/lib/motion.ts`
- Test: `src/lib/__tests__/motion.test.ts`

**Interfaces:**
- Consumes: `withSpring`, `withTiming` config shapes from `react-native-reanimated` (already a dependency); `Haptics.ImpactFeedbackStyle` from `expo-haptics` (already a dependency).
- Produces: `springs.pressIn`, `springs.pressOut`, `springs.gentle` (Reanimated `WithSpringConfig` objects) and `hapticForInteraction(kind: InteractionKind): void` — later phases import these instead of inlining spring configs/haptics calls per screen.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/motion.test.ts`:

```ts
import { springs, hapticForInteraction } from "../motion";
import * as Haptics from "expo-haptics";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
}));

describe("springs", () => {
  it("pressIn is stiffer (higher stiffness) than gentle", () => {
    expect(springs.pressIn.stiffness).toBeGreaterThan(springs.gentle.stiffness!);
  });

  it("all spring configs disable overshoot clamping consistently", () => {
    expect(springs.pressIn.overshootClamping).toBe(false);
    expect(springs.pressOut.overshootClamping).toBe(false);
    expect(springs.gentle.overshootClamping).toBe(false);
  });
});

describe("hapticForInteraction", () => {
  it("fires a light impact for 'press'", () => {
    hapticForInteraction("press");
    expect(Haptics.impactAsync).toHaveBeenCalledWith("light");
  });

  it("fires a medium impact for 'success'", () => {
    hapticForInteraction("success");
    expect(Haptics.impactAsync).toHaveBeenCalledWith("medium");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/__tests__/motion.test.ts`
Expected: FAIL — `Cannot find module '../motion'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/motion.ts`:

```ts
import * as Haptics from "expo-haptics";
import type { WithSpringConfig } from "react-native-reanimated";

export const springs = {
  pressIn: {
    stiffness: 400,
    damping: 20,
    mass: 0.5,
    overshootClamping: false,
  } satisfies WithSpringConfig,
  pressOut: {
    stiffness: 300,
    damping: 18,
    mass: 0.5,
    overshootClamping: false,
  } satisfies WithSpringConfig,
  gentle: {
    stiffness: 120,
    damping: 16,
    mass: 1,
    overshootClamping: false,
  } satisfies WithSpringConfig,
};

export type InteractionKind = "press" | "success" | "error";

export function hapticForInteraction(kind: InteractionKind): void {
  switch (kind) {
    case "press":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    case "success":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    case "error":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/__tests__/motion.test.ts`
Expected: PASS, all 4 test cases green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/motion.ts src/lib/__tests__/motion.test.ts
git commit -m "feat: add shared spring/haptic motion primitives"
```

---

## Task 6: CI gate

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `npm run lint`, `npm run typecheck`, `npm test` (all already runnable after Task 1).
- Produces: nothing consumed by later tasks — this is the terminal task of the plan.

- [ ] **Step 1: Verify all three commands pass locally first**

Run: `npm run lint && npm run typecheck && npm test`
Expected: all three exit 0. If any fails, fix it before writing the workflow — the workflow should never be the first place these are run.

- [ ] **Step 2: Write the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Test
        run: npm test -- --ci
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint/typecheck/test gate on pull requests"
```

- [ ] **Step 4: Push the branch and open a PR**

Run: `git push -u origin rebuild/00-foundation`
Then open a PR to `main` and confirm the new `CI / check` workflow run appears and goes green — this is the first real end-to-end verification that the workflow file is syntactically and functionally correct, since it can't be run locally.

---

## Self-review notes

- **Spec coverage:** Branch strategy (per-task commits on a phase branch, verified in Task 6 Step 4) — architecture doc (Task 2) — theme/tokens (Task 4) — motion primitives (Task 5) — testing (Task 1) — CI (Task 6) — Unistyles install (Task 3). All 7 Phase 0 spec sections have a task. Backend dedupe is intentionally excluded — separate plan per the spec's "parallel track" framing.
- **Placeholder scan:** none found — token hex values are explicitly real (if provisional) values per the spec's own "placeholder colors" allowance, not TBD markers.
- **Type consistency:** `AppTheme` (Task 4) matches the shape used in the `unistyles.d.ts` augmentation; `springs.*` keys used in the Task 5 test match the keys defined in the Task 5 implementation; `hapticForInteraction`'s `InteractionKind` union (`"press" | "success" | "error"`) matches every case the test exercises.
