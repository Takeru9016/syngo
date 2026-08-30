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
  typography: tokens.typography,
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
  typography: tokens.typography,
};

export type AppTheme = typeof lightTheme;
