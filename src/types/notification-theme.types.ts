/**
 * Notification Theme Types
 * Defines customization options for notification appearance
 */

// Visual style for notifications
export type NotificationVisualStyle = "solid" | "gradient" | "glassmorphic";

// Category-specific customization
export type NotificationCategory =
  | "nudges"
  | "stickers"
  | "todos"
  | "favorites"
  | "system";

// Color configuration for a notification category
export interface NotificationColorScheme {
  background: string;
  backgroundSecondary?: string; // For gradients
  text: string;
  accent: string;
  icon: string;
}

// Vibration pattern options
export type VibrationPatternName =
  | "default"
  | "gentle"
  | "strong"
  | "heartbeat"
  | "double"
  | "none";

export const VIBRATION_PATTERNS: Record<VibrationPatternName, number[]> = {
  default: [0, 200, 150, 200],
  gentle: [0, 100],
  strong: [0, 400, 100, 400],
  heartbeat: [0, 150, 100, 150, 300, 200],
  double: [0, 100, 100, 100],
  none: [],
};

// Theme preset configuration
export interface NotificationThemePreset {
  id: string;
  name: string;
  description: string;
  colors: Record<NotificationCategory, NotificationColorScheme>;
  visualStyle: NotificationVisualStyle;
  vibrationPattern: VibrationPatternName;
}

// User's custom notification settings
export interface NotificationCustomization {
  activePreset: string | null; // null = custom
  colors: Record<NotificationCategory, NotificationColorScheme>;
  visualStyle: NotificationVisualStyle; // Global default
  categoryStyles?: Partial<
    Record<NotificationCategory, NotificationVisualStyle>
  >; // Per-category overrides
  vibrationPattern: VibrationPatternName;
  borderRadius: number; // 8-24
  shadowIntensity: number; // 0-1
}

// Default colors per category
export const DEFAULT_CATEGORY_COLORS: Record<
  NotificationCategory,
  NotificationColorScheme
> = {
  nudges: {
    background: "#FF6987",
    backgroundSecondary: "#C9184A",
    text: "#FFFFFF",
    accent: "#FFB4C2",
    icon: "#FFFFFF",
  },
  stickers: {
    background: "#8B5CF6",
    backgroundSecondary: "#6D28D9",
    text: "#FFFFFF",
    accent: "#C4B5FD",
    icon: "#FFFFFF",
  },
  todos: {
    background: "#10B981",
    backgroundSecondary: "#059669",
    text: "#FFFFFF",
    accent: "#6EE7B7",
    icon: "#FFFFFF",
  },
  favorites: {
    background: "#F59E0B",
    backgroundSecondary: "#D97706",
    text: "#FFFFFF",
    accent: "#FCD34D",
    icon: "#FFFFFF",
  },
  system: {
    background: "#6366F1",
    backgroundSecondary: "#4F46E5",
    text: "#FFFFFF",
    accent: "#A5B4FC",
    icon: "#FFFFFF",
  },
};

// Theme presets
export const NOTIFICATION_THEME_PRESETS: NotificationThemePreset[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean and professional with solid colors",
    colors: DEFAULT_CATEGORY_COLORS,
    visualStyle: "solid",
    vibrationPattern: "default",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Bold gradients with rich colors",
    colors: {
      nudges: {
        background: "#FF3366",
        backgroundSecondary: "#FF0066",
        text: "#FFFFFF",
        accent: "#FFAABB",
        icon: "#FFFFFF",
      },
      stickers: {
        background: "#7C3AED",
        backgroundSecondary: "#9333EA",
        text: "#FFFFFF",
        accent: "#C4B5FD",
        icon: "#FFFFFF",
      },
      todos: {
        background: "#00C853",
        backgroundSecondary: "#00E676",
        text: "#FFFFFF",
        accent: "#B9F6CA",
        icon: "#FFFFFF",
      },
      favorites: {
        background: "#FF6D00",
        backgroundSecondary: "#FF9100",
        text: "#FFFFFF",
        accent: "#FFD180",
        icon: "#FFFFFF",
      },
      system: {
        background: "#3D5AFE",
        backgroundSecondary: "#536DFE",
        text: "#FFFFFF",
        accent: "#8C9EFF",
        icon: "#FFFFFF",
      },
    },
    visualStyle: "gradient",
    vibrationPattern: "strong",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Subtle and understated",
    colors: {
      nudges: {
        background: "#FEE2E8",
        backgroundSecondary: "#FECDD3",
        text: "#BE123C",
        accent: "#FB7185",
        icon: "#E11D48",
      },
      stickers: {
        background: "#EDE9FE",
        backgroundSecondary: "#DDD6FE",
        text: "#5B21B6",
        accent: "#8B5CF6",
        icon: "#7C3AED",
      },
      todos: {
        background: "#D1FAE5",
        backgroundSecondary: "#A7F3D0",
        text: "#065F46",
        accent: "#34D399",
        icon: "#059669",
      },
      favorites: {
        background: "#FEF3C7",
        backgroundSecondary: "#FDE68A",
        text: "#92400E",
        accent: "#FBBF24",
        icon: "#D97706",
      },
      system: {
        background: "#E0E7FF",
        backgroundSecondary: "#C7D2FE",
        text: "#3730A3",
        accent: "#818CF8",
        icon: "#4F46E5",
      },
    },
    visualStyle: "solid",
    vibrationPattern: "gentle",
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Sleek dark theme with neon accents",
    colors: {
      nudges: {
        background: "#1F1F2E",
        backgroundSecondary: "#2D2D44",
        text: "#FF6B9D",
        accent: "#FF6B9D",
        icon: "#FF6B9D",
      },
      stickers: {
        background: "#1F1F2E",
        backgroundSecondary: "#2D2D44",
        text: "#A78BFA",
        accent: "#A78BFA",
        icon: "#A78BFA",
      },
      todos: {
        background: "#1F1F2E",
        backgroundSecondary: "#2D2D44",
        text: "#34D399",
        accent: "#34D399",
        icon: "#34D399",
      },
      favorites: {
        background: "#1F1F2E",
        backgroundSecondary: "#2D2D44",
        text: "#FBBF24",
        accent: "#FBBF24",
        icon: "#FBBF24",
      },
      system: {
        background: "#1F1F2E",
        backgroundSecondary: "#2D2D44",
        text: "#60A5FA",
        accent: "#60A5FA",
        icon: "#60A5FA",
      },
    },
    visualStyle: "solid",
    vibrationPattern: "default",
  },
  {
    id: "pastel",
    name: "Pastel",
    description: "Soft and dreamy pastels",
    colors: {
      nudges: {
        background: "#FFDEE2",
        backgroundSecondary: "#FFE4E8",
        text: "#6B4C52",
        accent: "#FF8FA3",
        icon: "#E35D6A",
      },
      stickers: {
        background: "#E5DEFF",
        backgroundSecondary: "#EDE7FF",
        text: "#5B4B7A",
        accent: "#9B87F5",
        icon: "#7C3AED",
      },
      todos: {
        background: "#C8F7DC",
        backgroundSecondary: "#D4FADF",
        text: "#3F6553",
        accent: "#5ED693",
        icon: "#22C55E",
      },
      favorites: {
        background: "#FFE8CC",
        backgroundSecondary: "#FFECD5",
        text: "#7A5830",
        accent: "#FFAA5B",
        icon: "#F59E0B",
      },
      system: {
        background: "#D3E4FD",
        backgroundSecondary: "#DCE9FD",
        text: "#4A5F80",
        accent: "#6B9EF7",
        icon: "#3B82F6",
      },
    },
    visualStyle: "glassmorphic",
    vibrationPattern: "gentle",
  },
];

// Default customization settings
export const DEFAULT_NOTIFICATION_CUSTOMIZATION: NotificationCustomization = {
  activePreset: "classic",
  colors: DEFAULT_CATEGORY_COLORS,
  visualStyle: "solid",
  vibrationPattern: "default",
  borderRadius: 16,
  shadowIntensity: 0.3,
};
