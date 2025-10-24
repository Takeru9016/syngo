// tamagui.config.ts
import { createTamagui } from "tamagui";
import { createInterFont } from "@tamagui/font-inter";

const body = createInterFont();
const heading = createInterFont();

const config = createTamagui({
  defaultTheme: "dark",

  fonts: {
    body,
    heading,
  },

  themes: {
    light: {
      // Custom palette
      bg: "#ffffff",
      bgCard: "#f5f5fb",
      color: "#111111",
      primary: "#7C5CFC",
      primaryAlt: "#B7A6FF",
      muted: "#6b7280",

      // Tamagui standard keys (required by built-in components)
      background: "#ffffff",
      backgroundHover: "#f7f7fc",
      backgroundPress: "#efeff7",
      backgroundFocus: "#e8e8f3",
      backgroundStrong: "#e6e6ef",
      backgroundTransparent: "rgba(255,255,255,0)",

      color1: "#111111",
      color2: "#2a2a2e",
      color3: "#4a4a52",
      color4: "#6b7280",
      color5: "#9ca3af",
      color6: "#d1d5db",
      color7: "#e5e7eb",
      color8: "#f3f4f6",
      color9: "#f9fafb",
      color10: "#ffffff",

      borderColor: "#e6e6ef",
      borderColorHover: "#d9d9e6",
      borderColorPress: "#cdcede",
      borderColorFocus: "#bfc1d4",

      colorHover: "#0f0f12",
      colorPress: "#0a0a0c",
      colorFocus: "#0c0c0f",

      placeholderColor: "#9ca3af",
      shadowColor: "rgba(0,0,0,0.1)",
    },

    dark: {
      // Custom palette
      bg: "#0f0e1a",
      bgCard: "#1b1930",
      color: "#EDEAFB",
      primary: "#7C5CFC",
      primaryAlt: "#B7A6FF",
      muted: "#B7B6C3",

      // Tamagui standard keys
      background: "#0f0e1a",
      backgroundHover: "#151429",
      backgroundPress: "#1b1930",
      backgroundFocus: "#191736",
      backgroundStrong: "#1b1930",
      backgroundTransparent: "rgba(15,14,26,0)",

      color1: "#EDEAFB",
      color2: "#d9d7e8",
      color3: "#c5c3d5",
      color4: "#B7B6C3",
      color5: "#9a99ab",
      color6: "#7d7c8e",
      color7: "#605f71",
      color8: "#434254",
      color9: "#2a2744",
      color10: "#0f0e1a",

      borderColor: "#2a2744",
      borderColorHover: "#343056",
      borderColorPress: "#3d3966",
      borderColorFocus: "#4a4580",

      colorHover: "#ffffff",
      colorPress: "#f7f4ff",
      colorFocus: "#f0ecff",

      placeholderColor: "#7d7c8e",
      shadowColor: "rgba(0,0,0,0.5)",
    },
  },

  tokens: {
    color: {
      white: "#ffffff",
      black: "#000000",
      primary: "#7C5CFC",
      primaryAlt: "#B7A6FF",
      muted: "#B7B6C3",
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
      true: 8,
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
