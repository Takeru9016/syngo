/**
 * Widget Data Types
 *
 * Shared data structures for home screen widgets.
 * These mirror the JSON format stored in App Groups (iOS) / SharedPreferences (Android).
 */

import type { MoodLevel } from "./index";

/**
 * User info for widget display
 */
export interface WidgetUserData {
  /** Display name (truncated for widget) */
  name: string;
  /** Current mood level (1-5) */
  mood?: MoodLevel;
  /** Mood emoji for display */
  moodEmoji?: string;
  /** Avatar URL (for larger widgets) */
  avatarUrl?: string;
}

/**
 * Quick stats for dashboard widgets
 */
export interface WidgetStats {
  /** Number of incomplete todos */
  pendingTodos: number;
  /** Number of unread notifications */
  unreadNotifications: number;
  /** Days since pairing */
  daysTogether?: number;
}

/**
 * Latest activity for timeline widgets
 */
export interface WidgetActivity {
  /** Activity type */
  type: "nudge" | "sticker" | "todo" | "mood" | "favorite";
  /** Short description */
  text: string;
  /** Relative time (e.g., "2h ago") */
  timeAgo: string;
  /** Emoji or icon identifier */
  icon: string;
}

/**
 * Complete widget data payload
 * Serialized to JSON and stored in shared storage
 */
export interface WidgetData {
  /** Current user data */
  user: WidgetUserData;
  /** Partner data */
  partner: WidgetUserData;
  /** Quick stats */
  stats: WidgetStats;
  /** Recent activities (max 3-5 for widget) */
  recentActivities: WidgetActivity[];
  /** ISO timestamp of last update */
  lastUpdated: string;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user has a partner */
  hasPair: boolean;
}

/**
 * Mood level to emoji mapping
 */
export const WIDGET_MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "😊",
  5: "😄",
};

/**
 * Default widget data for unauthenticated or unpaired state
 */
export const DEFAULT_WIDGET_DATA: WidgetData = {
  user: { name: "You" },
  partner: { name: "Partner" },
  stats: { pendingTodos: 0, unreadNotifications: 0 },
  recentActivities: [],
  lastUpdated: new Date().toISOString(),
  isAuthenticated: false,
  hasPair: false,
};
