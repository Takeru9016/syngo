/**
 * Widget Service
 *
 * Prepares widget data from app state and saves to shared storage.
 * iOS: Uses App Groups UserDefaults
 * Android: Uses SharedPreferences
 */

import { Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
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
   * For Android, widgets are updated via the widget task handler which reads from AsyncStorage
   * The data should be saved to storage before calling this
   */
  async reloadWidgets(): Promise<void> {
    try {
      if (Platform.OS === "android") {
        // Import widget components dynamically to avoid circular deps
        const { 
          PartnerStatusWidget,
          MoodWidget,
          QuickNudgeWidget,
          QuickActionsWidget,
          FullDashboardWidget,
          CoupleOverviewWidget,
        } = await import("@/widgets/SyngoWidgets");
        
        // Load current data from storage
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        const { WIDGET_DATA_KEY, createEmptyWidgetData } = await import("@/types/widget-data.types");
        
        let data = createEmptyWidgetData();
        try {
          const jsonString = await AsyncStorage.getItem(`widget:${WIDGET_DATA_KEY}`);
          if (jsonString) {
            data = JSON.parse(jsonString);
          }
        } catch {
          // Use empty data on error
        }
        
        // Request update for each widget type with proper render function
        const widgetConfigs = [
          { name: "SyngoPartnerStatus", Component: PartnerStatusWidget },
          { name: "SyngoMood", Component: MoodWidget },
          { name: "SyngoQuickNudge", Component: QuickNudgeWidget },
          { name: "SyngoQuickActions", Component: QuickActionsWidget },
          { name: "SyngoDashboard", Component: FullDashboardWidget },
          { name: "SyngoCoupleOverview", Component: CoupleOverviewWidget },
        ];
        
        await Promise.all(
          widgetConfigs.map(({ name, Component }) =>
            requestWidgetUpdate({
              widgetName: name,
              // Use React.createElement since this is a .ts file (not .tsx)
              renderWidget: () => require("react").createElement(Component, { data }),
              widgetNotFound: () => {
                // Widget not on home screen, ignore
              },
            }).catch(() => {
              // Ignore individual widget update errors
            })
          )
        );
      } else {
        // iOS uses ExtensionStorage to reload widget timelines
        await ExtensionStorage.reloadWidget();
      }
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
