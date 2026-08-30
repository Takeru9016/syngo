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
