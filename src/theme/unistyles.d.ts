import "react-native-unistyles";
import type { ThemeMap } from "./themes";
import type { breakpoints } from "./breakpoints";

declare module "react-native-unistyles" {
  interface UnistylesThemes extends ThemeMap {}
  interface UnistylesBreakpoints
    extends Record<keyof typeof breakpoints, number> {}
}
