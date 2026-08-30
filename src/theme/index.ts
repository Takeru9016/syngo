import { StyleSheet } from "react-native-unistyles";
import { breakpoints } from "./breakpoints";
import { lightTheme, darkTheme } from "./themes";

// react-native-unistyles v3.3.0 registers themes/breakpoints via
// StyleSheet.configure — the installed package has no UnistylesRegistry
// export (that's a v2 API). See task-4-report.md for verification.
StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  breakpoints,
});

export { tokens } from "./tokens";
export { lightTheme, darkTheme } from "./themes";
export type { AppTheme } from "./themes";
