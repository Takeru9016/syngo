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
    // Text/icon color rendered on top of `accents[*].primary`. The 8 pastel
    // primaries are identical in light and dark mode, so this is a fixed deep
    // ink in both — the mode's own `text` color would drop to ~1.5:1 against
    // them in dark mode. This value clears 4.5:1 on all 8 primaries
    // (mocha is the tightest at 5.4:1).
    onPrimary: "#201716",
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
