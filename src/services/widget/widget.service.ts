/**
 * Widget Service
 *
 * Prepares and stores widget data for native home screen widgets.
 * Handles data serialization and storage to App Groups (iOS) / SharedPreferences (Android).
 */

import { formatDistanceToNow, differenceInDays } from "date-fns";

import { auth } from "@/config/firebase";
import { useProfileStore } from "@/store/profile";
import { usePairingStore } from "@/store/pairing";
import type {
  WidgetData,
  WidgetUserData,
  WidgetActivity,
} from "@/types/widget-data.types";
import {
  DEFAULT_WIDGET_DATA,
  WIDGET_MOOD_EMOJIS,
} from "@/types/widget-data.types";
import type { MoodEntry, AppNotification } from "@/types";
import { ExtensionStorage } from "@/utils/ExtensionStorage";

const WIDGET_DATA_KEY = "syngo_widget_data";

/**
 * Build user data for widget
 */
function buildUserData(
  name: string,
  mood?: MoodEntry | null,
  avatarUrl?: string,
): WidgetUserData {
  return {
    name: name.length > 12 ? name.slice(0, 12) + "…" : name,
    mood: mood?.level,
    moodEmoji: mood?.level ? WIDGET_MOOD_EMOJIS[mood.level] : undefined,
    avatarUrl,
  };
}

/**
 * Build activity item from notification
 */
function buildActivity(
  type: WidgetActivity["type"],
  text: string,
  timestamp: Date | number,
  icon: string,
): WidgetActivity {
  const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  const truncatedText = text.length > 30 ? text.slice(0, 30) + "…" : text;

  return {
    type,
    text: truncatedText,
    timeAgo: formatDistanceToNow(date, { addSuffix: true }),
    icon,
  };
}

/**
 * Prepare widget data from current app state
 */
export async function prepareWidgetData(options: {
  userMood?: MoodEntry | null;
  partnerMood?: MoodEntry | null;
  pendingTodos?: number;
  unreadNotifications?: number;
  recentNotifications?: AppNotification[];
}): Promise<WidgetData> {
  const currentUser = auth.currentUser;
  const profile = useProfileStore.getState().profile;
  const partnerProfile = useProfileStore.getState().partnerProfile;
  const isPaired = usePairingStore.getState().isPaired;

  // Not authenticated
  if (!currentUser) {
    return {
      ...DEFAULT_WIDGET_DATA,
      lastUpdated: new Date().toISOString(),
    };
  }

  // No pair
  if (!isPaired || !profile?.pairId || !partnerProfile) {
    return {
      ...DEFAULT_WIDGET_DATA,
      isAuthenticated: true,
      user: buildUserData(currentUser.displayName || "You"),
      lastUpdated: new Date().toISOString(),
    };
  }

  // Days together calculation from pair creation date
  const pairCreatedAt = usePairingStore.getState().pairCreatedAt;
  const daysTogether =
    pairCreatedAt ?
      differenceInDays(new Date(), new Date(pairCreatedAt))
    : undefined;

  // Build recent activities from notifications
  const recentActivities: WidgetActivity[] = (options.recentNotifications || [])
    .slice(0, 5)
    .map((notif) => {
      const typeMap: Record<string, WidgetActivity["type"]> = {
        nudge: "nudge",
        sticker_sent: "sticker",
        todo_created: "todo",
        todo_completed: "todo",
        mood_updated: "mood",
        favorite_added: "favorite",
      };
      const iconMap: Record<string, string> = {
        nudge: "💕",
        sticker_sent: "🎨",
        todo_created: "✅",
        todo_completed: "✅",
        mood_updated: "😊",
        favorite_added: "⭐",
      };

      const activityType = typeMap[notif.type] || "nudge";
      return buildActivity(
        activityType,
        notif.title,
        notif.createdAt,
        iconMap[notif.type] || "📱",
      );
    });

  return {
    user: buildUserData(
      currentUser.displayName || "You",
      options.userMood,
      currentUser.photoURL || undefined,
    ),
    partner: buildUserData(
      partnerProfile.displayName || "Partner",
      options.partnerMood,
      partnerProfile.avatarUrl,
    ),
    stats: {
      pendingTodos: options.pendingTodos || 0,
      unreadNotifications: options.unreadNotifications || 0,
      daysTogether,
    },
    recentActivities,
    lastUpdated: new Date().toISOString(),
    isAuthenticated: true,
    hasPair: true,
  };
}

/**
 * Save widget data to native storage
 */
export async function saveWidgetData(data: WidgetData): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    await ExtensionStorage.set(WIDGET_DATA_KEY, jsonString);
  } catch (error) {
    console.warn("[WidgetService] Failed to save widget data:", error);
  }
}

/**
 * Update widgets with latest data
 * Call this on app foreground, after data changes, or on push notification
 */
export async function updateWidgets(options: {
  userMood?: MoodEntry | null;
  partnerMood?: MoodEntry | null;
  pendingTodos?: number;
  unreadNotifications?: number;
  recentNotifications?: AppNotification[];
}): Promise<void> {
  const data = await prepareWidgetData(options);
  await saveWidgetData(data);
  await ExtensionStorage.reloadWidgets();
}

/**
 * Clear widget data (on logout)
 */
export async function clearWidgetData(): Promise<void> {
  await saveWidgetData(DEFAULT_WIDGET_DATA);
  await ExtensionStorage.reloadWidgets();
}
