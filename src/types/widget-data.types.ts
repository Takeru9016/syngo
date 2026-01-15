/**
 * Widget Data Types
 *
 * Data structures shared between React Native app and native widget code.
 * These types define the contract for data passed to iOS (SwiftUI) and
 * Android widgets via shared storage (App Groups / SharedPreferences).
 */

// Inline mood types to avoid importing from index.ts (which has many dependencies)
export type WidgetMoodLevel = 1 | 2 | 3 | 4 | 5;
type MoodLevel = WidgetMoodLevel;

// Inline mood constants for widget use
const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "🙂",
  5: "😊",
};

const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "Struggling",
  2: "Down",
  3: "Okay",
  4: "Good",
  5: "Great",
};

// ============================================================================
// Partner Data
// ============================================================================

export type WidgetPartnerData = {
  /** Partner's display name */
  name: string;
  /** Partner's avatar URL (Cloudinary), null if not set */
  avatarUrl: string | null;
  /** Mood emoji (😢 😔 😐 🙂 😊), null if no mood today */
  moodEmoji: string | null;
  /** Mood label (Struggling, Down, Okay, Good, Great), null if no mood */
  moodLabel: string | null;
  /** Mood level (1-5), null if no mood today */
  moodLevel: MoodLevel | null;
};

// ============================================================================
// User's Own Data
// ============================================================================

export type WidgetUserData = {
  /** User's display name */
  name: string;
  /** User's avatar URL, null if not set */
  avatarUrl: string | null;
  /** User's mood emoji, null if no mood today */
  moodEmoji: string | null;
  /** User's mood label, null if no mood today */
  moodLabel: string | null;
  /** User's mood level (1-5), null if no mood today */
  moodLevel: MoodLevel | null;
};

// ============================================================================
// Notification Data
// ============================================================================

export type WidgetNotificationData = {
  /** Notification ID */
  id: string;
  /** Notification type (sticker_sent, todo_reminder, nudge, etc.) */
  type: string;
  /** Notification title */
  title: string;
  /** Notification body text */
  body: string;
  /** Creation timestamp (ms since epoch) */
  timestamp: number;
  /** Whether the notification has been read */
  isRead: boolean;
  /** Optional image URL for sticker/favorite notifications */
  imageUrl?: string;
};

// ============================================================================
// Stats Data
// ============================================================================

export type WidgetStatsData = {
  /** Number of notifications today */
  updatesToday: number;
  /** Number of unread notifications */
  unreadCount: number;
  /** Number of stickers sent/received this week */
  stickersThisWeek: number;
  /** Number of pending todos */
  pendingTodos: number;
};

// ============================================================================
// Main Widget Data Container
// ============================================================================

export type WidgetData = {
  /** Partner's data, null if not paired */
  partner: WidgetPartnerData | null;
  /** User's own data */
  user: WidgetUserData | null;
  /** Activity stats */
  stats: WidgetStatsData;
  /** Latest notification for preview, null if none */
  latestNotification: WidgetNotificationData | null;
  /** Recent notifications for list widgets (up to 3) */
  recentNotifications: WidgetNotificationData[];
  /** Last widget data update timestamp (ms) */
  lastUpdated: number;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user is paired with a partner */
  isPaired: boolean;
};

// ============================================================================
// Widget Configuration
// ============================================================================

/** Deep link URLs for widget actions */
export const WIDGET_DEEP_LINKS = {
  home: "syngo://",
  nudge: "syngo://nudge",
  todos: "syngo://todos",
  mood: "syngo://mood",
  favorites: "syngo://favorites",
  notifications: "syngo://notifications",
  pair: "syngo://pair",
} as const;

/** App Group identifier for iOS shared storage */
export const APP_GROUP_ID = "group.com.sahiljadhav.syngo";

/** SharedPreferences key for Android widget data */
export const WIDGET_DATA_KEY = "syngo_widget_data";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates an empty/default widget data object
 */
export function createEmptyWidgetData(): WidgetData {
  return {
    partner: null,
    user: null,
    stats: {
      updatesToday: 0,
      unreadCount: 0,
      stickersThisWeek: 0,
      pendingTodos: 0,
    },
    latestNotification: null,
    recentNotifications: [],
    lastUpdated: Date.now(),
    isAuthenticated: false,
    isPaired: false,
  };
}

/**
 * Converts mood level to widget partner data format
 */
export function moodToWidgetFormat(level: MoodLevel | undefined): {
  emoji: string | null;
  label: string | null;
  level: MoodLevel | null;
} {
  if (!level) {
    return { emoji: null, label: null, level: null };
  }
  return {
    emoji: MOOD_EMOJIS[level],
    label: MOOD_LABELS[level],
    level,
  };
}
