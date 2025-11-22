import { createFont } from "tamagui";

// Body font: Inter (clean, modern sans)
export const bodyFont = createFont({
  family: "Inter-Regular",
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
    1: "400", // Regular
    2: "400",
    3: "500", // Medium
    4: "600", // SemiBold
    5: "700", // Bold
    6: "700",
    7: "700",
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
  // Map weight values to actual font files
  face: {
    400: { normal: "Inter-Regular" },
    500: { normal: "Inter-Medium" },
    600: { normal: "Inter-SemiBold" },
    700: { normal: "Inter-Bold" },
  },
});

// Heading font: Playfair Display (elegant serif for romantic touch)
export const headingFont = createFont({
  family: "PlayfairDisplay-SemiBold",
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
    1: "600", // SemiBold
    2: "600",
    3: "700", // Bold
    4: "700",
    5: "800", // ExtraBold
    6: "800",
    7: "900", // Black
    8: "900",
    9: "900",
  },
  letterSpacing: {
    1: 0,
    2: -0.5,
    3: -0.5,
    4: -0.5,
    5: -1,
    6: -1,
    7: -1.5,
    8: -1.5,
    9: -2,
  },
  // Map weight values to actual font files
  face: {
    600: { normal: "PlayfairDisplay-SemiBold" },
    700: { normal: "PlayfairDisplay-Bold" },
    800: { normal: "PlayfairDisplay-ExtraBold" },
    900: { normal: "PlayfairDisplay-Black" },
  },
});
