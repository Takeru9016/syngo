import "react-native-unistyles";
import type { lightTheme, darkTheme } from "./themes";
import type { breakpoints } from "./breakpoints";

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints
    extends Record<keyof typeof breakpoints, number> {}
}
