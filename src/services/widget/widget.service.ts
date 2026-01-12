/**
 * Widget Service
 *
 * Prepares widget data from app state and saves to shared storage.
 * iOS: Uses App Groups UserDefaults
 * Android: Uses SharedPreferences
 */

import { getCurrentUserId } from "@/services/auth/auth.service";
import { useProfileStore } from "@/store/profile";
import {
  WidgetData,
  WidgetPartnerData,
  WidgetUserData,
  WidgetNotificationData,
  WidgetStatsData,
  createEmptyWidgetData,
  moodToWidgetFormat,
  WIDGET_DATA_KEY,
} from "@/types/widget-data.types";
import { AppNotification, MoodEntry } from "@/types";
import ExtensionStorage from "@/utils/ExtensionStorage";

/**
 * Widget Service - Manages widget data preparation and updates
 */
export const WidgetService = {
  /**
   * Prepare widget data from current app state
   */
  prepareWidgetData(params: {
    notifications?: AppNotification[];
    myMood?: MoodEntry | null;
    partnerMood?: MoodEntry | null;
    pendingTodos?: number;
  }): WidgetData {
    const {
      notifications = [],
      myMood,
      partnerMood,
      pendingTodos = 0,
    } = params;

    const uid = getCurrentUserId();
    const { profile, partnerProfile } = useProfileStore.getState();

    // Not authenticated
    if (!uid || !profile) {
      return {
        ...createEmptyWidgetData(),
        isAuthenticated: false,
        isPaired: false,
      };
    }

    // Build user data
    const userMood = moodToWidgetFormat(myMood?.level);
    const user: WidgetUserData = {
      name: profile.displayName || "You",
      avatarUrl: profile.avatarUrl || null,
      moodEmoji: userMood.emoji,
      moodLabel: userMood.label,
      moodLevel: userMood.level,
    };

    // Build partner data (null if not paired)
    let partner: WidgetPartnerData | null = null;
    if (profile.pairId && partnerProfile) {
      const pMood = moodToWidgetFormat(partnerMood?.level);
      partner = {
        name: partnerProfile.displayName || "Partner",
        avatarUrl: partnerProfile.avatarUrl || null,
        moodEmoji: pMood.emoji,
        moodLabel: pMood.label,
        moodLevel: pMood.level,
      };
    }

    // Build stats
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    const stats: WidgetStatsData = {
      updatesToday: notifications.filter((n) => n.createdAt >= todayStart)
        .length,
      unreadCount: notifications.filter((n) => !n.read).length,
      stickersThisWeek: notifications.filter(
        (n) => n.type === "sticker_sent" && n.createdAt >= weekAgo
      ).length,
      pendingTodos,
    };

    // Build notification data
    const sortedNotifications = [...notifications]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);

    const recentNotifications: WidgetNotificationData[] =
      sortedNotifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        timestamp: n.createdAt,
        isRead: n.read,
        imageUrl: n.data?.imageUrl,
      }));

    const latestNotification = recentNotifications[0] || null;

    return {
      partner,
      user,
      stats,
      latestNotification,
      recentNotifications,
      lastUpdated: Date.now(),
      isAuthenticated: true,
      isPaired: !!profile.pairId,
    };
  },

  /**
   * Save widget data to shared storage for native widgets to read
   */
  async saveToSharedStorage(data: WidgetData): Promise<void> {
    try {
      const jsonString = JSON.stringify(data);
      await ExtensionStorage.set(WIDGET_DATA_KEY, jsonString);
    } catch (error) {
      console.error("❌ [WidgetService] Failed to save widget data:", error);
    }
  },

  /**
   * Trigger widget refresh on iOS/Android
   */
  async reloadWidgets(): Promise<void> {
    try {
      await ExtensionStorage.reloadWidget();
    } catch (error) {
      console.error("❌ [WidgetService] Failed to reload widgets:", error);
    }
  },

  /**
   * Full update: prepare data, save to storage, and reload widgets
   */
  async updateWidgets(params: {
    notifications?: AppNotification[];
    myMood?: MoodEntry | null;
    partnerMood?: MoodEntry | null;
    pendingTodos?: number;
  }): Promise<void> {
    try {
      const data = this.prepareWidgetData(params);
      await this.saveToSharedStorage(data);
      await this.reloadWidgets();
    } catch (error) {
      console.error("❌ [WidgetService] Failed to update widgets:", error);
    }
  },

  /**
   * Clear widget data (on logout)
   */
  async clearWidgetData(): Promise<void> {
    try {
      await ExtensionStorage.remove(WIDGET_DATA_KEY);
      await this.reloadWidgets();
    } catch (error) {
      console.error("❌ [WidgetService] Failed to clear widget data:", error);
    }
  },
};
