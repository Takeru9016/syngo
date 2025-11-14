import { createTamagui } from "tamagui";
import { createInterFont } from "@tamagui/font-inter";
import { shorthands } from "@tamagui/shorthands";
import { createMedia } from "@tamagui/react-native-media-driver";

const bodyFont = createInterFont({
  family: "Inter",
  size: {
    1: 11,
    2: 13,
    3: 15,
    4: 17,
    5: 20,
    6: 24,
    7: 28,
    8: 34,
    9: 40,
  },
  lineHeight: {
    1: 14,
    2: 18,
    3: 20,
    4: 22,
    5: 26,
    6: 30,
    7: 34,
    8: 40,
    9: 46,
  },
  weight: {
    1: "300",
    2: "400",
    3: "500",
    4: "600",
    5: "700",
    6: "800",
    7: "900",
  },
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  },
});

const headingFont = createInterFont({
  family: "Inter",
  size: {
    1: 13,
    2: 15,
    3: 17,
    4: 20,
    5: 24,
    6: 28,
    7: 32,
    8: 40,
    9: 48,
  },
  weight: {
    1: "500",
    2: "600",
    3: "700",
    4: "800",
    5: "900",
    6: "900",
    7: "900",
    8: "900",
    9: "900",
  },
});

const config = createTamagui({
  defaultTheme: "dark",
  themeClassNameOnRoot: true,
  shouldAddPrefersColorThemes: true,

  shorthands,

  fonts: {
    body: bodyFont,
    heading: headingFont,
  },

  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 661 },
    gtSm: { minWidth: 801 },
    gtMd: { minWidth: 1021 },
    gtLg: { minWidth: 1281 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" },
  }),

  themes: {
    light: {
      // semantic top‑level
      bg: "#F9FAFB",
      bgCard: "#FFFFFF",
      color: "#111827",
      primary: "#8B5CF6",
      primaryAlt: "#F472B6",
      muted: "#6B7280",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",

      // tamagui-standard keys
      background: "#F9FAFB",
      backgroundHover: "#F3F4F6",
      backgroundPress: "#E5E7EB",
      backgroundFocus: "#E5E7EB",
      backgroundStrong: "#E5E7EB",
      backgroundTransparent: "rgba(249,250,251,0)",

      color1: "#111827",
      color2: "#1F2933",
      color3: "#374151",
      color4: "#4B5563",
      color5: "#6B7280",
      color6: "#9CA3AF",
      color7: "#D1D5DB",
      color8: "#E5E7EB",
      color9: "#F3F4F6",
      color10: "#FFFFFF",

      borderColor: "#E5E7EB",
      borderColorHover: "#D1D5DB",
      borderColorPress: "#9CA3AF",
      borderColorFocus: "#8B5CF6",

      colorHover: "#030712",
      colorPress: "#000000",
      colorFocus: "#111827",

      placeholderColor: "#9CA3AF",
      shadowColor: "rgba(15,23,42,0.08)",
    },

    dark: {
      // semantic top‑level
      bg: "#050816",
      bgCard: "#0B1020",
      color: "#F9FAFB",
      primary: "#A855F7",
      primaryAlt: "#FB7185",
      muted: "#9CA3AF",
      success: "#34D399",
      warning: "#FBBF24",
      error: "#F87171",

      // tamagui-standard keys
      background: "#050816",
      backgroundHover: "#090C1A",
      backgroundPress: "#0B1020",
      backgroundFocus: "#111827",
      backgroundStrong: "#111827",
      backgroundTransparent: "rgba(5,8,22,0)",

      color1: "#F9FAFB",
      color2: "#E5E7EB",
      color3: "#D1D5DB",
      color4: "#9CA3AF",
      color5: "#6B7280",
      color6: "#4B5563",
      color7: "#374151",
      color8: "#1F2933",
      color9: "#111827",
      color10: "#020617",

      borderColor: "#1F2933",
      borderColorHover: "#374151",
      borderColorPress: "#4B5563",
      borderColorFocus: "#A855F7",

      colorHover: "#FFFFFF",
      colorPress: "#E5E7EB",
      colorFocus: "#F9FAFB",

      placeholderColor: "#6B7280",
      shadowColor: "rgba(0,0,0,0.6)",
    },
  },

  tokens: {
    color: {
      white: "#FFFFFF",
      black: "#000000",
      primary: "#8B5CF6",
      primaryAlt: "#F472B6",
      muted: "#6B7280",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      transparent: "rgba(0,0,0,0)",
    },
    space: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
      true: 8,
    },
    size: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
      true: 16,
    },
    radius: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      true: 12,
    },
    zIndex: {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      10: 10,
      100: 100,
      1000: 1000,
    },
  },
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
