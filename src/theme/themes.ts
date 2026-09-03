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

export type ThemeMap = {
  [K in `${ColorScheme}_${StructuralMode}`]: AppTheme;
};

export const themes = Object.fromEntries(
  SCHEMES.flatMap((scheme) =>
    MODES.map(
      (mode) => [`${scheme}_${mode}`, buildTheme(scheme, mode)] as const,
    ),
  ),
) as ThemeMap;
