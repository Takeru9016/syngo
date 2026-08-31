# Syngo Rebuild — Phase 1: Auth/Pairing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `app/onboarding.tsx` and `app/pair.tsx` off Tamagui onto Unistyles, replacing the Phase 0 placeholder single-theme scaffold with the real 16-theme color system (8 user-selectable accent schemes × light/dark), and establish `src/features/pairing/` as the first feature-first folder.

**Architecture:** Rebuild `src/theme/` to generate 16 named Unistyles themes from 2 structural bases (light/dark) × 8 accent overlays, replacing `adaptiveThemes` with a manual sync hook that bridges the existing `useThemeStore` to `UnistylesRuntime.setTheme()`. Move pairing-specific store/service/components into `src/features/pairing/`, updating every consumer's import path. Rewrite both screens (and the two pairing-only leaf components they use) from Tamagui primitives to RN primitives + Unistyles `StyleSheet.create`, replacing Tamagui's `pressStyle` with Phase 0's `src/lib/motion.ts` spring primitives.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript (strict), react-native-unistyles v3.3.0, react-native-reanimated, expo-haptics, jest-expo, @testing-library/react-native, Zustand.

**Spec:** `docs/superpowers/specs/2026-08-30-syngo-rebuild-phase1-auth-pairing-design.md`

## Global Constraints

- Only `app/onboarding.tsx`, `app/pair.tsx`, and the pairing-specific files this plan explicitly relocates are in scope. No other screen changes.
- Tamagui is **not removed from the app** — `TamaguiProvider`/`Theme` in `app/_layout.tsx` stays, serving every not-yet-migrated screen. Only the two screens in scope, plus the pairing components/theme system feeding them, drop Tamagui.
- No backend/Firestore schema or rules changes.
- Every new/changed file must pass `npx tsc --noEmit` in strict mode.
- New code goes under `src/theme/`, `src/features/pairing/`, or modifies existing files in `app/`, `src/store/`, `src/services/`, `src/hooks/`, `src/components/` (the last four only for import-path fixes as pairing files relocate) — no new top-level directories.
- `useThemeStore` (`src/state/theme.ts`) is **not modified** — its `{mode, colorScheme}` shape is already exactly what the sync hook needs.
- `src/services/profile/profile.service.ts` is **not relocated** — it's consumed by settings, `_layout.tsx`, and pairing; Phase 1 only migrates pairing-specific files.

---

## Task 1: Theme color system — 16 named themes from structural bases × accent overlays

**Files:**
- Modify: `src/theme/tokens.ts`
- Modify: `src/theme/themes.ts`
- Modify: `src/theme/index.ts`
- Modify: `src/theme/unistyles.d.ts`
- Test: `src/theme/__tests__/themes.test.tsx` (replaces Phase 0's placeholder test)

**Interfaces:**
- Consumes: nothing new (Phase 0's `react-native-unistyles` install and Babel wiring).
- Produces: `themes` (exported from `src/theme/themes.ts`) — a `Record` with exactly 16 keys of the form `` `${ColorScheme}_${"light"|"dark"}` `` (e.g. `"coral_light"`, `"sunset_dark"`), each an `AppTheme`-shaped object. `tokens` (from `src/theme/tokens.ts`) carries the real Muted Blush values. Task 2 consumes `themes`' key format directly (string template) and `UnistylesRuntime.setTheme` (typed against these 16 keys via the `UnistylesThemes` augmentation). Task 4/5/6 consume `AppTheme`'s `colors` shape: `background`, `surface`, `surfaceSoft`, `border`, `text`, `textMuted`, `primary`, `primarySoft`, `accent`, `success`, `warning`, `error`.

- [ ] **Step 1: Rewrite `tokens.ts` with the Muted Blush palette**

Create (overwrite) `src/theme/tokens.ts`:

```ts
// Muted Blush — the real Phase 1 palette (picked via visual review of 3
// warm directions; see
// docs/superpowers/specs/2026-08-30-syngo-rebuild-phase1-auth-pairing-design.md).
// `structural` colors don't vary by accent scheme; `accents` are the 8
// user-selectable color schemes (unchanged across light/dark, matching
// the pre-existing Tamagui theme behavior this replaces — see
// `tamagui.config.ts`'s per-scheme theme definitions).
export const tokens = {
  color: {
    structural: {
      light: {
        background: "#FBF1EC",
        surface: "#FFFFFF",
        surfaceSoft: "#F5E5DE",
        border: "#EFDFD9",
        text: "#3A2A28",
        textMuted: "#9C8580",
      },
      dark: {
        background: "#201716",
        surface: "#2C201F",
        surfaceSoft: "#28201E",
        border: "#3F312F",
        text: "#F2E4E0",
        textMuted: "#B8A19C",
      },
    },
    accents: {
      coral: { primary: "#E3A08F", primarySoft: "#F0CBC1" },
      rose: { primary: "#E8AEB8", primarySoft: "#F2D2D8" },
      plum: { primary: "#B79BB0", primarySoft: "#D7C8D4" },
      lavender: { primary: "#B8AAD6", primarySoft: "#D8D0E8" },
      mocha: { primary: "#A6897A", primarySoft: "#CEBEB6" },
      ocean: { primary: "#86A8B8", primarySoft: "#BCCFD8" },
      sunset: { primary: "#E8B892", primarySoft: "#F2D8C3" },
      sky: { primary: "#9BC0D2", primarySoft: "#C8DCE6" },
    },
    accent: "#6B7A4F", // secondary accent (olive) — scheme-independent, unchanged from Phase 0
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
  typography: {
    fontFamily: {
      emotional: "PlayfairDisplay-SemiBold",
      ui: "Inter-Regular",
    },
    size: {
      sm: 13,
      md: 15,
      lg: 18,
      xl: 24,
    },
  },
} as const;
```

- [ ] **Step 2: Rewrite `themes.ts` as a generator over structural × accent**

Create (overwrite) `src/theme/themes.ts`:

```ts
import { tokens } from "./tokens";

export type ColorScheme = keyof typeof tokens.color.accents;
export type StructuralMode = keyof typeof tokens.color.structural;

function buildTheme(scheme: ColorScheme, mode: StructuralMode) {
  const structural = tokens.color.structural[mode];
  const accentOverlay = tokens.color.accents[scheme];

  return {
    colors: {
      background: structural.background,
      surface: structural.surface,
      surfaceSoft: structural.surfaceSoft,
      border: structural.border,
      text: structural.text,
      textMuted: structural.textMuted,
      primary: accentOverlay.primary,
      primarySoft: accentOverlay.primarySoft,
      accent: tokens.color.accent,
      success: tokens.color.success,
      warning: tokens.color.warning,
      error: tokens.color.error,
    },
    space: tokens.space,
    radius: tokens.radius,
    typography: tokens.typography,
  };
}

const SCHEMES = Object.keys(tokens.color.accents) as ColorScheme[];
const MODES = Object.keys(tokens.color.structural) as StructuralMode[];

export type AppTheme = ReturnType<typeof buildTheme>;

type ThemeMap = {
  [K in `${ColorScheme}_${StructuralMode}`]: AppTheme;
};

export const themes = Object.fromEntries(
  SCHEMES.flatMap((scheme) =>
    MODES.map(
      (mode) => [`${scheme}_${mode}`, buildTheme(scheme, mode)] as const,
    ),
  ),
) as ThemeMap;
```

- [ ] **Step 3: Register the 16 themes in `index.ts`, drop `adaptiveThemes`**

Modify `src/theme/index.ts` — replace its entire contents:

```ts
import { StyleSheet } from "react-native-unistyles";
import { breakpoints } from "./breakpoints";
import { themes } from "./themes";

// v3.3.0 has no adaptive-themes-only path that also supports 16
// user-selectable named themes — Phase 1 switches themes manually via
// UnistylesRuntime.setTheme (see useThemeSync.ts), so `adaptiveThemes`
// is dropped. `initialTheme` matches useThemeStore's own defaults
// (colorScheme: "coral", mode: "system" resolving to "light" pre-hydration)
// so there's no flash of an unstyled/wrong theme before useThemeSync's
// first effect runs.
StyleSheet.configure({
  settings: {
    initialTheme: "coral_light",
  },
  themes,
  breakpoints,
});

export { tokens } from "./tokens";
export { themes } from "./themes";
export type { AppTheme, ColorScheme, StructuralMode } from "./themes";
```

- [ ] **Step 4: Update the TypeScript module augmentation**

Modify `src/theme/unistyles.d.ts` — replace its entire contents:

```ts
import "react-native-unistyles";
import type { themes } from "./themes";
import type { breakpoints } from "./breakpoints";

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends typeof themes {}
  export interface UnistylesBreakpoints
    extends Record<keyof typeof breakpoints, number> {}
}
```

- [ ] **Step 5: Write the failing test**

Create (overwrite) `src/theme/__tests__/themes.test.tsx`:

```tsx
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { themes } from "../themes";
import "../index"; // registers themes/breakpoints as a side effect

describe("theme registration", () => {
  it("registers exactly 16 themes, one per scheme x mode combination", () => {
    const keys = Object.keys(themes).sort();
    const expected = [
      "coral_light",
      "coral_dark",
      "rose_light",
      "rose_dark",
      "plum_light",
      "plum_dark",
      "lavender_light",
      "lavender_dark",
      "mocha_light",
      "mocha_dark",
      "ocean_light",
      "ocean_dark",
      "sunset_light",
      "sunset_dark",
      "sky_light",
      "sky_dark",
    ].sort();
    expect(keys).toEqual(expected);
  });

  it("keeps a scheme's primary color identical across light and dark", () => {
    expect(themes.rose_light.colors.primary).toBe(themes.rose_dark.colors.primary);
    expect(themes.rose_light.colors.primary).toBe("#E8AEB8");
  });

  it("varies structural colors by mode but not by scheme", () => {
    expect(themes.coral_light.colors.background).toBe(
      themes.sky_light.colors.background,
    );
    expect(themes.coral_light.colors.background).not.toBe(
      themes.coral_dark.colors.background,
    );
  });
});

const styles = StyleSheet.create((theme) => ({
  label: {
    color: theme.colors.primary,
  },
}));

function Probe() {
  return <Text style={styles.label}>hello</Text>;
}

describe("Unistyles theme switching", () => {
  it("resolves a themed style for an explicitly-set theme without throwing", async () => {
    UnistylesRuntime.setTheme("sunset_light");
    await render(<Probe />);
    expect(screen.getByText("hello")).toBeTruthy();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx jest src/theme/__tests__/themes.test.tsx`
Expected: FAIL — `themes.rose_light` etc. don't exist yet, or the module still exports the old Phase 0 shape (`lightTheme`/`darkTheme`).

- [ ] **Step 7: Run test to verify it passes**

Run: `npx jest src/theme/__tests__/themes.test.tsx`
Expected: PASS, all 4 test cases green.

- [ ] **Step 8: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors. (This also exercises `src/theme/breakpoints.ts`, unchanged from Phase 0 — no edits needed there.)

- [ ] **Step 9: Commit**

```bash
git add src/theme/tokens.ts src/theme/themes.ts src/theme/index.ts src/theme/unistyles.d.ts src/theme/__tests__/themes.test.tsx
git commit -m "feat: replace placeholder theme with 16-theme Muted Blush color system"
```

---

## Task 2: Theme sync hook — bridge `useThemeStore` to `UnistylesRuntime`

**Files:**
- Create: `src/theme/useThemeSync.ts`
- Test: `src/theme/__tests__/useThemeSync.test.ts`

**Interfaces:**
- Consumes: `themes` keys / `UnistylesRuntime.setTheme` (Task 1); `useThemeStore` from `src/state/theme.ts` (`mode: "light"|"dark"|"system"`, `colorScheme: ColorScheme`, unmodified); `useUnistyles` from `react-native-unistyles` (`rt.colorScheme: "light"|"dark"|"unspecified"`, reactive to OS appearance changes).
- Produces: `useThemeSync(): void` — a hook with no return value, called once near the root of each migrated screen (Task 5, Task 6). Every render where `colorScheme` or the resolved mode changed calls `UnistylesRuntime.setTheme()` with the matching one of Task 1's 16 keys.

- [ ] **Step 1: Write the failing test**

Create `src/theme/__tests__/useThemeSync.test.ts`:

```ts
import { renderHook } from "@testing-library/react-native";
import { UnistylesRuntime } from "react-native-unistyles";
import { useThemeStore } from "@/state/theme";
import { useThemeSync } from "../useThemeSync";
import "../index";

describe("useThemeSync", () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: "system", colorScheme: "coral" });
    jest.spyOn(UnistylesRuntime, "setTheme");
    (UnistylesRuntime as { colorScheme: string }).colorScheme = "light";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sets the theme for an explicit light mode", () => {
    useThemeStore.setState({ mode: "light", colorScheme: "rose" });
    renderHook(() => useThemeSync());
    expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("rose_light");
  });

  it("sets the theme for an explicit dark mode", () => {
    useThemeStore.setState({ mode: "dark", colorScheme: "ocean" });
    renderHook(() => useThemeSync());
    expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("ocean_dark");
  });

  it("resolves system mode using the OS color scheme", () => {
    (UnistylesRuntime as { colorScheme: string }).colorScheme = "dark";
    useThemeStore.setState({ mode: "system", colorScheme: "sunset" });
    renderHook(() => useThemeSync());
    expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("sunset_dark");
  });

  it("re-runs when colorScheme changes", () => {
    useThemeStore.setState({ mode: "light", colorScheme: "coral" });
    const { rerender } = renderHook(() => useThemeSync());
    expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith("coral_light");

    useThemeStore.setState({ mode: "light", colorScheme: "plum" });
    rerender({});
    expect(UnistylesRuntime.setTheme).toHaveBeenLastCalledWith("plum_light");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/theme/__tests__/useThemeSync.test.ts`
Expected: FAIL — `Cannot find module '../useThemeSync'`.

- [ ] **Step 3: Write the implementation**

Create `src/theme/useThemeSync.ts`:

```ts
import { useEffect } from "react";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";
import { useThemeStore } from "@/state/theme";

export function useThemeSync(): void {
  const mode = useThemeStore((s) => s.mode);
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { rt } = useUnistyles();

  const resolvedMode = mode === "system" ? rt.colorScheme : mode;
  const themeName = `${colorScheme}_${resolvedMode === "dark" ? "dark" : "light"}` as const;

  useEffect(() => {
    UnistylesRuntime.setTheme(themeName);
  }, [themeName]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/theme/__tests__/useThemeSync.test.ts`
Expected: PASS, all 4 test cases green.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/theme/useThemeSync.ts src/theme/__tests__/useThemeSync.test.ts
git commit -m "feat: sync useThemeStore to Unistyles via UnistylesRuntime.setTheme"
```

---

## Task 3: Move pairing store/service into `src/features/pairing/`

**Files:**
- Create: `src/features/pairing/store.ts` (moved from `src/store/pairing.ts`, import path fixed)
- Create: `src/features/pairing/service.ts` (moved from `src/services/pairing/pairing.service.ts`, verbatim — no internal import changes needed, none of its imports are moving)
- Create: `src/features/pairing/index.ts`
- Delete: `src/store/pairing.ts`
- Delete: `src/services/pairing/pairing.service.ts` (and the now-empty `src/services/pairing/` directory)
- Modify: `app/pair.tsx:18` (import path only)
- Modify: `app/_layout.tsx:15` (import path only)
- Modify: `app/(tabs)/settings.tsx:40` (import path only)
- Modify: `src/hooks/useWidgetUpdates.ts:16` (import path only)
- Modify: `src/services/widget/widget.service.ts:12` (import path only)
- Modify: `src/hooks/useDaysTogether.ts:1` (import path only)

**Interfaces:**
- Consumes: nothing new — this is a pure relocation, `PairingState`'s shape and every exported function's signature are unchanged.
- Produces: `usePairingStore` now importable as `import { usePairingStore } from "@/features/pairing"` (the only valid external import path per `docs/ARCHITECTURE.md`). Task 4 adds component exports to the same `index.ts`. Task 6 imports `usePairingStore` this way.

`usePairingStore` is consumed outside the pairing feature (widget service, settings, days-together) — this is the intended incremental-migration pattern: non-migrated code importing a migrated feature's public surface, not a feature-boundary violation (that rule is about features importing each other's *internals*, not other code importing a feature's *index.ts*).

- [ ] **Step 1: Move the service file**

```bash
mkdir -p src/features/pairing
git mv src/services/pairing/pairing.service.ts src/features/pairing/service.ts
```

The file's own imports (`@/config/firebase`, `@/services/auth/auth.service`, `@/services/profile/profile.service`, `@/types`, `@/utils/code-generator`) are all absolute-aliased and none of those files are moving — no edits needed to the file's contents.

- [ ] **Step 2: Move the store file, fix its internal import**

```bash
git mv src/store/pairing.ts src/features/pairing/store.ts
```

In `src/features/pairing/store.ts`, change:

```ts
import * as pairingService from "@/services/pairing/pairing.service";
```

to:

```ts
import * as pairingService from "./service";
```

(`formatCode` from `@/utils/code-generator` is unaffected — that file isn't moving.)

- [ ] **Step 3: Create the feature's public surface**

Create `src/features/pairing/index.ts`:

```ts
export { usePairingStore } from "./store";
export type { PairingState } from "./store";
```

- [ ] **Step 4: Update every consumer's import path**

In each of these 6 files, change the import line from `@/store/pairing` to `@/features/pairing` (the imported symbol, `usePairingStore`, is unchanged):

`app/pair.tsx`:
```ts
import { usePairingStore } from "@/features/pairing";
```

`app/_layout.tsx`:
```ts
import { usePairingStore } from "@/features/pairing";
```

`app/(tabs)/settings.tsx`:
```ts
import { usePairingStore } from "@/features/pairing";
```

`src/hooks/useWidgetUpdates.ts`:
```ts
import { usePairingStore } from "@/features/pairing";
```

`src/services/widget/widget.service.ts`:
```ts
import { usePairingStore } from "@/features/pairing";
```

`src/hooks/useDaysTogether.ts`:
```ts
import { usePairingStore } from "@/features/pairing";
```

- [ ] **Step 5: Remove the now-empty old service directory**

```bash
rmdir src/services/pairing
```

(If this fails because the directory isn't empty, list its contents — something was missed in Step 1.)

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors. This will fail loudly (`Cannot find module '@/store/pairing'`) if any consumer was missed — grep for `@/store/pairing` across the repo to confirm zero remaining hits if it does.

- [ ] **Step 7: Run the full test suite**

Run: `pnpm test --ci`
Expected: all existing suites still pass (this task changes no behavior, only file locations).

- [ ] **Step 8: Commit**

```bash
git add -A src/features/pairing src/store src/services/pairing app/pair.tsx "app/_layout.tsx" "app/(tabs)/settings.tsx" src/hooks/useWidgetUpdates.ts src/services/widget/widget.service.ts src/hooks/useDaysTogether.ts
git commit -m "refactor: move pairing store/service into src/features/pairing/"
```

---

## Task 4: Rewrite `CodeInput` and `Countdown` on Unistyles

**Files:**
- Create: `src/features/pairing/components/CodeInput.tsx` (rewritten from `src/components/PairingModal/CodeInput.tsx`)
- Create: `src/features/pairing/components/Countdown.tsx` (rewritten from `src/components/PairingModal/Countdown.tsx`)
- Modify: `src/features/pairing/index.ts` (add component exports)
- Modify: `src/components/index.ts` (remove the 2 `PairingModal` export lines)
- Delete: `src/components/PairingModal/CodeInput.tsx`, `src/components/PairingModal/Countdown.tsx`, and the now-empty `src/components/PairingModal/` directory
- Test: `src/features/pairing/components/__tests__/CodeInput.test.tsx`
- Test: `src/features/pairing/components/__tests__/Countdown.test.tsx`

**Interfaces:**
- Consumes: `AppTheme['colors']` (Task 1) via `StyleSheet.create(theme => ...)`.
- Produces: `CodeInput` — same props as before (`length?, group?, value?, onChange?, autoFocus?, disabled?, error?`), same forwardRef<TextInput> — and `Countdown` — same `{expiresAt}` prop, both now default exports removed in favor of named exports for consistency (`Countdown` was previously a default export; Task 6 imports both as named exports from `@/features/pairing`). Task 6 (`pair.tsx`) consumes both unchanged in behavior.

- [ ] **Step 1: Write the failing test for CodeInput**

Create `src/features/pairing/components/__tests__/CodeInput.test.tsx`:

```tsx
import React, { useState } from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { CodeInput } from "../CodeInput";

function Controlled({ error }: { error?: string | null }) {
  const [value, setValue] = useState("");
  return <CodeInput length={6} group={3} value={value} onChange={setValue} error={error} />;
}

describe("CodeInput", () => {
  it("renders 6 digit slots", () => {
    render(<Controlled />);
    expect(screen.getAllByDisplayValue("")).toHaveLength(6);
  });

  it("fills a digit and calls onChange with the full padded value", () => {
    const onChange = jest.fn();
    render(<CodeInput length={6} group={3} value="" onChange={onChange} />);
    const inputs = screen.getAllByDisplayValue("");
    fireEvent.changeText(inputs[0], "a");
    expect(onChange).toHaveBeenCalledWith("A");
  });

  it("clears the current digit on backspace when it has a value", () => {
    const onChange = jest.fn();
    render(<CodeInput length={6} group={3} value="AB1" onChange={onChange} />);
    const filled = screen.getByDisplayValue("B");
    fireEvent(filled, "keyPress", { nativeEvent: { key: "Backspace" } });
    expect(onChange).toHaveBeenCalledWith("A1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/pairing/components/__tests__/CodeInput.test.tsx`
Expected: FAIL — `Cannot find module '../CodeInput'`.

- [ ] **Step 3: Write the CodeInput implementation**

Create `src/features/pairing/components/CodeInput.tsx`:

```tsx
import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { TextInput, View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type Props = {
  length?: number;
  group?: number;
  value?: string;
  onChange?: (digits: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: string | null;
};

export const CodeInput = forwardRef<TextInput, Props>(function CodeInput(
  { length = 6, group = 3, value = "", onChange, autoFocus, disabled, error },
  _ref,
) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const blocks = useMemo(() => Array.from({ length }), [length]);

  const setChar = (index: number, char: string) => {
    const clean = char
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .slice(-1);
    if (!clean) return;

    const arr = value.split("");
    arr[index] = clean;
    const next = Array.from({ length })
      .map((_, i) => arr[i] ?? "")
      .join("");

    onChange?.(next);

    if (clean && index < length - 1) {
      setTimeout(() => {
        inputs.current[index + 1]?.focus();
      }, 10);
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === "Backspace") {
      const arr = value.split("");
      if (arr[index]) {
        arr[index] = "";
        const next = Array.from({ length })
          .map((_, i) => arr[i] ?? "")
          .join("");
        onChange?.(next);
      } else if (index > 0) {
        setTimeout(() => {
          inputs.current[index - 1]?.focus();
        }, 10);
        arr[index - 1] = "";
        const next = Array.from({ length })
          .map((_, i) => arr[i] ?? "")
          .join("");
        onChange?.(next);
      }
    }
  };

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <View style={styles.row}>
      {blocks.map((_, i) => {
        const showHyphenAfter = group > 0 && i === group - 1;
        return (
          <React.Fragment key={i}>
            <View style={[styles.slot, !!error && styles.slotError]}>
              <TextInput
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                value={value[i] ?? ""}
                onChangeText={(t) => setChar(i, t)}
                onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
                keyboardType="default"
                autoCapitalize="characters"
                textAlign="center"
                maxLength={1}
                editable={!disabled}
                selectTextOnFocus
                style={styles.input}
              />
            </View>
            {showHyphenAfter && i < length - 1 ? (
              <Text style={styles.hyphen}>-</Text>
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    width: "100%",
  },
  slot: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  slotError: {
    borderColor: theme.colors.error,
  },
  input: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.text,
    padding: 0,
    margin: 0,
    width: "100%",
    textAlign: "center",
  },
  hyphen: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.textMuted,
    fontSize: 22,
    fontWeight: "700",
  },
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/features/pairing/components/__tests__/CodeInput.test.tsx`
Expected: PASS, all 3 test cases green.

- [ ] **Step 5: Write the failing test for Countdown**

Create `src/features/pairing/components/__tests__/Countdown.test.tsx`:

```tsx
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Countdown } from "../Countdown";

describe("Countdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows a placeholder when there is no expiry", () => {
    render(<Countdown expiresAt={null} />);
    expect(screen.getByText("--:--")).toBeTruthy();
  });

  it("formats remaining time as mm:ss", () => {
    const expiresAt = Date.now() + 125_000; // 2:05
    render(<Countdown expiresAt={expiresAt} />);
    expect(screen.getByText("02:05")).toBeTruthy();
  });

  it("shows 00:00 once expired", () => {
    const expiresAt = Date.now() - 1_000;
    render(<Countdown expiresAt={expiresAt} />);
    expect(screen.getByText("00:00")).toBeTruthy();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx jest src/features/pairing/components/__tests__/Countdown.test.tsx`
Expected: FAIL — `Cannot find module '../Countdown'`.

- [ ] **Step 7: Write the Countdown implementation**

Create `src/features/pairing/components/Countdown.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function Countdown({ expiresAt }: { expiresAt?: number | null }) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { label, expired } = useMemo(() => {
    if (!expiresAt) return { label: "--:--", expired: false };
    const delta = Math.max(0, Math.floor((expiresAt - now) / 1000));
    const m = Math.floor(delta / 60).toString().padStart(2, "0");
    const s = (delta % 60).toString().padStart(2, "0");
    return { label: `${m}:${s}`, expired: delta === 0 };
  }, [expiresAt, now]);

  return (
    <Text style={styles.label}>
      Code expires in{" "}
      <Text style={[styles.value, expired && styles.expired]}>{label}</Text>
    </Text>
  );
}

const styles = StyleSheet.create((theme) => ({
  label: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: theme.typography.size.sm,
  },
  value: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  expired: {
    color: theme.colors.warning,
  },
}));
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx jest src/features/pairing/components/__tests__/Countdown.test.tsx`
Expected: PASS, all 3 test cases green.

- [ ] **Step 9: Wire the components into the feature's public surface**

Modify `src/features/pairing/index.ts` — add two lines:

```ts
export { usePairingStore } from "./store";
export type { PairingState } from "./store";
export { CodeInput } from "./components/CodeInput";
export { Countdown } from "./components/Countdown";
```

- [ ] **Step 10: Remove the old Tamagui components**

```bash
git rm src/components/PairingModal/CodeInput.tsx src/components/PairingModal/Countdown.tsx
rmdir src/components/PairingModal
```

In `src/components/index.ts`, remove these two lines (currently lines 1-2):

```ts
export { CodeInput } from "./PairingModal/CodeInput";
export { default as Countdown } from "./PairingModal/Countdown";
```

- [ ] **Step 11: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors. (`app/pair.tsx` still imports the old `CodeInput`/`Countdown` from `@/components` at this point — Task 6 fixes that. If this step errors on `app/pair.tsx`'s import, that confirms Step 10 correctly removed the old exports; leave `app/pair.tsx` as-is, Task 6 handles it.)

- [ ] **Step 12: Commit**

```bash
git add src/features/pairing src/components/index.ts
git commit -m "feat: rewrite CodeInput and Countdown on Unistyles, drop Tamagui versions"
```

---

## Task 5: Rewrite `app/onboarding.tsx` on Unistyles

**Files:**
- Modify: `app/onboarding.tsx` (full rewrite)

**Interfaces:**
- Consumes: `useThemeSync` (Task 2), `AppTheme['colors']`/`typography`/`space` via `StyleSheet.create` (Task 1), `springs` from `src/lib/motion.ts` (Phase 0).
- Produces: nothing consumed by later tasks — this screen is a leaf.

- [ ] **Step 1: Rewrite the screen**

Replace the entire contents of `app/onboarding.tsx`:

```tsx
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { useThemeSync } from "@/theme/useThemeSync";
import { useAuthStore } from "@/store/auth";
import { updateUserProfile } from "@/services/profile/profile.service";
import { springs } from "@/lib/motion";
import { triggerSelectionHaptic } from "@/state/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingScreen() {
  useThemeSync();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleGetStarted = async () => {
    try {
      if (user?.uid) {
        await updateUserProfile(user.uid, {
          showOnboardingAfterUnpair: false,
        });
      }
      router.replace("/pair");
    } catch (err) {
      console.warn("⚠️ Failed to update onboarding flag:", err);
      router.replace("/pair");
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <Text style={styles.title}>Syngo</Text>
          <Text style={styles.subtitle}>
            A cozy little space for just the two of you.
          </Text>
        </View>

        <View style={styles.hero}>
          <Image
            source={require("../assets/illustrations/onboarding-3d-hero.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.heroCaption}>
            Tiny reminders, shared todos, and pinned moments that keep you
            gently in sync — without the noise of other apps.
          </Text>
        </View>

        <View style={[styles.bottom, { marginBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.pitch}>
            <Text style={styles.pitchTitle}>Stay close, even on busy days.</Text>
            <Text style={styles.pitchBody}>
              Set little nudges, track shared tasks, and save moments that
              matter — to both of you.
            </Text>
          </View>

          <AnimatedPressable
            style={[styles.cta, animatedStyle]}
            onPressIn={() => {
              scale.value = withSpring(0.97, springs.pressIn);
            }}
            onPressOut={() => {
              scale.value = withSpring(1, springs.pressOut);
            }}
            onPress={() => {
              triggerSelectionHaptic();
              handleGetStarted();
            }}
          >
            <Text style={styles.ctaLabel}>Get started together</Text>
          </AnimatedPressable>

          <Text style={styles.footnote}>
            You&apos;ll only see this when you&apos;re not paired.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    padding: theme.space.xl,
    justifyContent: "space-between",
  },
  brand: {
    gap: theme.space.sm,
  },
  title: {
    fontFamily: theme.typography.fontFamily.emotional,
    fontSize: 36,
    lineHeight: 44,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: theme.typography.size.md,
    color: theme.colors.textMuted,
  },
  hero: {
    alignItems: "center",
    paddingVertical: theme.space.lg,
    gap: theme.space.xs,
    flex: 1,
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    maxWidth: 500,
    aspectRatio: 1,
  },
  heroCaption: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 500,
  },
  bottom: {
    gap: theme.space.lg,
  },
  pitch: {
    gap: theme.space.sm,
  },
  pitchTitle: {
    fontFamily: theme.typography.fontFamily.emotional,
    fontSize: 24,
    lineHeight: 30,
    color: theme.colors.text,
    textAlign: "center",
  },
  pitchBody: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: theme.typography.size.md,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  cta: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.background,
    fontWeight: "600",
    fontSize: 17,
  },
  footnote: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: theme.space.xs,
  },
}));
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Lint**

Run: `pnpm run lint`
Expected: zero errors.

- [ ] **Step 4: Run the full test suite**

Run: `pnpm test --ci`
Expected: all suites still pass (this screen has no dedicated test — its only logic, `handleGetStarted`, is a thin wrapper around already-untested-at-this-layer `updateUserProfile` + `router.replace`, matching the design spec's testing scope which targets pairing feature logic, not screen wiring).

- [ ] **Step 5: Commit**

```bash
git add app/onboarding.tsx
git commit -m "feat: migrate onboarding screen from Tamagui to Unistyles"
```

---

## Task 6: Rewrite `app/pair.tsx` on Unistyles

**Files:**
- Modify: `app/pair.tsx` (full rewrite)

**Interfaces:**
- Consumes: `useThemeSync` (Task 2); `AppTheme` via `StyleSheet.create` (Task 1); `usePairingStore`, `CodeInput`, `Countdown` from `@/features/pairing` (Task 3, Task 4); `springs` from `@/lib/motion` (Phase 0).
- Produces: nothing consumed by later tasks — terminal screen of this plan.

- [ ] **Step 1: Rewrite the screen**

Replace the entire contents of `app/pair.tsx`:

```tsx
import { useState, useEffect, useMemo, type ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, Share, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { useThemeSync } from "@/theme/useThemeSync";
import { CodeInput, Countdown, usePairingStore } from "@/features/pairing";
import { formatCode, unformatCode } from "@/utils/code-generator";
import { subscribeToProfile } from "@/services/profile/profile.service";
import { triggerSelectionHaptic } from "@/state/haptics";
import { useToast } from "@/hooks/useToast";
import { springs } from "@/lib/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressScaleButton({
  children,
  style,
  disabled,
  onPress,
}: {
  children: ReactNode;
  style: object;
  disabled?: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle, disabled && styles.disabled]}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, springs.pressIn);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.pressOut);
      }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function PairScreen() {
  useThemeSync();
  const insets = useSafeAreaInsets();
  const {
    isPaired,
    pairId,
    code: myCode,
    expiresAt,
    isLoading,
    error,
    generateCode,
    redeemCode,
    checkExistingCode,
    setPairId,
    clearError,
  } = usePairingStore();
  const { success, error: toastError } = useToast();

  const [input, setInput] = useState<string>("");

  useEffect(() => {
    const unsubscribe = subscribeToProfile((profile) => {
      setPairId(profile?.pairId ?? null);
    });
    return () => unsubscribe();
  }, [setPairId]);

  useEffect(() => {
    if (!myCode || !expiresAt) {
      checkExistingCode().then((hasCode) => {
        if (!hasCode) {
          handleGenerate();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPaired && pairId) {
      router.replace("/(tabs)");
    }
  }, [isPaired, pairId]);

  const handleInputChange = (newValue: string) => {
    setInput(newValue);
    if (error) {
      clearError();
    }
  };

  const handleGenerate = async () => {
    triggerSelectionHaptic();
    await generateCode();
  };

  const handleCopy = async () => {
    if (myCode) {
      triggerSelectionHaptic();
      await Clipboard.setStringAsync(unformatCode(myCode));
      success("Copied!", "Code copied to clipboard");
    }
  };

  const handleShare = async () => {
    if (!myCode) return;
    try {
      triggerSelectionHaptic();
      await Share.share({
        message: `Join me on Syngo! Use this code to pair: ${myCode}`,
      });
    } catch (err) {
      console.error("Error sharing code:", err);
    }
  };

  const codeExpired = useMemo(() => {
    return !!expiresAt && Date.now() > expiresAt;
  }, [expiresAt]);

  const handleRedeem = async () => {
    const cleanInput = input.replace(/[^A-Z0-9]/gi, "");

    if (!cleanInput || cleanInput.length !== 6) {
      toastError("Invalid Code", "Please enter a valid 6-character code.");
      return;
    }

    const formattedCode = unformatCode(input);
    triggerSelectionHaptic();
    await redeemCode(formattedCode);
  };

  const displayCode = myCode ? formatCode(unformatCode(myCode)) : "---·---";

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 120 : 80}
        extraHeight={120}
        style={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pair with your partner</Text>
        </View>
        <Text style={styles.subtitle}>
          Pair and start sending cute reminders, stickers, and notes.
        </Text>

        <View style={styles.shareCard}>
          <Text style={styles.cardTitle}>I want to invite my partner</Text>

          <View style={styles.codeRow}>
            {isLoading && !myCode ? (
              <ActivityIndicator size="large" color={styles.primaryColor.color} />
            ) : (
              <Text style={styles.codeDisplay}>{displayCode}</Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            <PressScaleButton
              style={styles.primaryButton}
              disabled={isLoading || codeExpired || !myCode}
              onPress={handleCopy}
            >
              {isLoading ? (
                <ActivityIndicator color={styles.onPrimaryColor.color} />
              ) : (
                <Text style={styles.primaryButtonLabel}>Copy</Text>
              )}
            </PressScaleButton>
            <PressScaleButton
              style={styles.outlineButton}
              disabled={isLoading || codeExpired || !myCode}
              onPress={handleShare}
            >
              <Text style={styles.outlineButtonLabel}>Share</Text>
            </PressScaleButton>
          </View>

          <View style={styles.countdownRow}>
            <Countdown expiresAt={expiresAt} />
            <PressScaleButton
              style={styles.regenerateButton}
              disabled={isLoading}
              onPress={handleGenerate}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={styles.primaryColor.color} />
              ) : (
                <Text style={styles.regenerateLabel}>Regenerate</Text>
              )}
            </PressScaleButton>
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerBadge}>
            <Text style={styles.dividerLabel}>or</Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.redeemCard}>
          <Text style={styles.cardTitle}>I have a code</Text>
          <Text style={styles.subtitle}>Enter your partner&apos;s code</Text>

          <View style={styles.codeInputWrap}>
            <CodeInput length={6} group={3} value={input} onChange={handleInputChange} error={error} />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PressScaleButton
            style={styles.primaryButton}
            disabled={isLoading || input.replace(/[^A-Z0-9]/gi, "").length < 6}
            onPress={handleRedeem}
          >
            {isLoading ? (
              <ActivityIndicator color={styles.onPrimaryColor.color} />
            ) : (
              <Text style={styles.primaryButtonLabel}>Pair now</Text>
            )}
          </PressScaleButton>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.space.xl,
    paddingTop: theme.space.sm,
    gap: theme.space.lg,
  },
  header: {
    marginTop: theme.space.lg,
    marginBottom: theme.space.sm,
  },
  title: {
    fontFamily: theme.typography.fontFamily.emotional,
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.md,
    lineHeight: 22,
    marginBottom: theme.space.sm,
  },
  shareCard: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.lg,
    padding: theme.space.xl,
    gap: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.emotional,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
  codeRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.space.md,
  },
  codeDisplay: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.space.md,
  },
  primaryColor: {
    color: theme.colors.primary,
  },
  onPrimaryColor: {
    color: theme.colors.background,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.background,
    fontWeight: "700",
    fontSize: 16,
  },
  outlineButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  countdownRow: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.md,
  },
  regenerateButton: {
    borderRadius: theme.radius.md,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    height: 44,
    paddingHorizontal: theme.space.md,
    alignItems: "center",
    justifyContent: "center",
  },
  regenerateLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: theme.space.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: theme.space.md,
  },
  dividerLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  redeemCard: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.lg,
    padding: theme.space.xl,
    gap: theme.space.lg,
    marginBottom: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  codeInputWrap: {
    alignItems: "center",
  },
  errorBox: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.sm,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
}));
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Lint**

Run: `pnpm run lint`
Expected: zero errors.

- [ ] **Step 4: Run the full test suite**

Run: `pnpm test --ci`
Expected: all suites pass, including Task 1/2/4's new tests exercised transitively.

- [ ] **Step 5: Verify no Tamagui remains in the migrated surface**

Run: `grep -rn "from \"tamagui\"" app/onboarding.tsx app/pair.tsx src/features/pairing/`
Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add app/pair.tsx
git commit -m "feat: migrate pairing screen from Tamagui to Unistyles"
```

---

## Self-review notes

- **Spec coverage:** 16-theme color system + Muted Blush palette (Task 1) — theme sync/manual switching (Task 2) — `src/features/pairing/` folder migration (Task 3) — full Tamagui removal from both screens and their pairing-only components (Task 4, 5, 6) — testing on pairing feature logic (Task 2's sync hook, Task 4's CodeInput/Countdown). All design-doc sections covered.
- **Cross-task consumers found beyond the 2 screens:** `usePairingStore` is also consumed by `app/_layout.tsx`, `app/(tabs)/settings.tsx`, `src/hooks/useWidgetUpdates.ts`, `src/services/widget/widget.service.ts`, and `src/hooks/useDaysTogether.ts` — all 6 import sites are updated in Task 3, not just the 2 in-scope screens.
- **Design-doc token additions not spelled out in the design doc:** `surfaceSoft` and `border` colors (needed for card backgrounds, dividers, and input borders that Tamagui's `$bgSoft`/`$borderColor` provided) are added to Task 1's structural tokens, using the same values already shown in the design doc's visual-review mockup (`#F5E5DE`/`#EFDFD9` light, `#28201E`/`#3F312F` dark) — not new invented colors.
- **`ScreenContainer` dropped from `pair.tsx`:** the original screen wrapped its content in `<ScreenContainer>` (`src/components/common/`), which itself imports `YStack`/`XStack`/`Text` from Tamagui — reusing it would mean `pair.tsx` still renders through Tamagui transitively even with zero direct Tamagui imports, contradicting the design doc's "render via Unistyles only." Task 6 inlines the small amount of layout `ScreenContainer` provided (safe-area padding, `KeyboardAwareScrollView`) directly instead. `ScreenContainer` itself is untouched — it's explicitly out of scope (shared, not migrated this phase) and every other screen still using it is unaffected.
- **Haptics:** `pair.tsx`/`onboarding.tsx` keep using `src/state/haptics.ts`'s `triggerSelectionHaptic` (respects the user's vibration preference toggle) rather than Phase 0's `src/lib/motion.ts` `hapticForInteraction` (which doesn't check that preference) — only `springs` is taken from `motion.ts`. Using `hapticForInteraction` here would be a silent behavior regression (ignoring the user's vibration setting).
- **Type consistency:** `AppTheme` (Task 1) is used identically in Task 2 (`useThemeSync`'s theme name construction), Task 4 (`CodeInput`/`Countdown`'s `StyleSheet.create` callbacks), and Task 5/6 (`onboarding.tsx`/`pair.tsx`'s `StyleSheet.create` callbacks) — same `colors`/`space`/`radius`/`typography` field names throughout. `ColorScheme` (Task 1, re-exported from `themes.ts`) matches `src/state/theme.ts`'s existing `ColorScheme` union structurally (same 8 literal strings), used interchangeably in Task 2.
- **Placeholder scan:** none found — every color value is a real (picked-via-review) hex, not a TBD marker.
