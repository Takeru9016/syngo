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
