import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "@/services/auth/auth.service";
import { useNotificationPreferences } from "@/store/notificationPreference";

// Foreground behavior - dynamically checks user preferences
Notifications.setNotificationHandler({
  handleNotification: async () => {
    const { preferences } = useNotificationPreferences.getState();
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: preferences.sound,
      shouldSetBadge: false,
    };
  },
});

export type NotificationCategory =
  | "reminders"
  | "stickers"
  | "favorites"
  | "nudges"
  | "system";

export type BaseScheduleOptions = {
  title: string;
  body: string;
  data?: Record<string, any>;
  category?: NotificationCategory;
  androidChannelId?: string;
  iosSound?: string | boolean;
};

export type OneShotScheduleOptions = BaseScheduleOptions & {
  mode: "one-shot";
  when: Date;
};

export type IntervalScheduleOptions = BaseScheduleOptions & {
  mode: "interval";
  seconds: number;
  repeats: boolean;
};

export type DailyScheduleOptions = BaseScheduleOptions & {
  mode: "daily";
  hour: number;
  minute: number;
};

export type ScheduleOptions =
  | OneShotScheduleOptions
  | IntervalScheduleOptions
  | DailyScheduleOptions;

export const NotificationService = {
  async init(): Promise<void> {
    await this.ensurePermissions();
    await this.configureAndroidChannels();
  },

  async ensurePermissions(): Promise<boolean> {
    const settings = await Notifications.getPermissionsAsync();
    if (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED
    ) {
      return true;
    }
    const req = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return (
      req.granted ||
      req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED
    );
  },

  async configureAndroidChannels(): Promise<void> {
    if (Platform.OS !== "android") return;

    // Get vibration pattern from customization
    const { customization } = useNotificationPreferences.getState();
    const { VIBRATION_PATTERNS } = await import("@/types/notification-theme.types");
    const vibrationPattern = VIBRATION_PATTERNS[customization.vibrationPattern] || [0, 200, 150, 200];

    // Get accent colors for LED from customization
    const nudgeColor = customization.colors.nudges.accent;

    const channels: {
      id: string;
      name: string;
      importance: Notifications.AndroidImportance;
      sound?: string;
      lightColor?: string;
      vibrationPattern?: number[];
    }[] = [
        {
          id: "default",
          name: "General",
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: "notification.mp3",
          lightColor: customization.colors.system.accent,
          vibrationPattern,
        },
        {
          id: "reminders",
          name: "Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "notification.mp3",
          lightColor: customization.colors.todos.accent,
          vibrationPattern,
        },
        {
          id: "stickers",
          name: "Stickers",
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: "notification.mp3",
          lightColor: customization.colors.stickers.accent,
          vibrationPattern,
        },
        {
          id: "favorites",
          name: "Favorites",
          importance: Notifications.AndroidImportance.LOW,
          sound: "notification.mp3",
          lightColor: customization.colors.favorites.accent,
          vibrationPattern,
        },
        {
          id: "nudges",
          name: "Nudges",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "notification.mp3",
          lightColor: nudgeColor,
          vibrationPattern,
        },
        {
          id: "system",
          name: "System",
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: "notification.mp3",
          lightColor: customization.colors.system.accent,
          vibrationPattern,
        },
      ];

    for (const ch of channels) {
      await Notifications.setNotificationChannelAsync(ch.id, {
        name: ch.name,
        importance: ch.importance,
        lightColor: ch.lightColor,
        vibrationPattern: ch.vibrationPattern,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: ch.sound,
      });
    }
  },

  async scheduleLocalNotification(opts: ScheduleOptions): Promise<string> {
    const granted = await this.ensurePermissions();
    if (!granted) throw new Error("Notification permissions not granted");

    const androidChannelId =
      Platform.OS === "android"
        ? opts.androidChannelId || categoryToChannel(opts.category)
        : undefined;

    let trigger: Notifications.NotificationTriggerInput;

    switch (opts.mode) {
      case "one-shot": {
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: opts.when,
          channelId: androidChannelId,
        };
        break;
      }

      case "interval": {
        if (opts.repeats && opts.seconds < 60) {
          throw new Error(
            "Repeating interval notifications require at least 60 seconds"
          );
        }
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: opts.seconds,
          repeats: opts.repeats,
          channelId: androidChannelId,
        };
        break;
      }

      case "daily": {
        if (opts.hour < 0 || opts.hour > 23) {
          throw new Error("Hour must be between 0 and 23");
        }
        if (opts.minute < 0 || opts.minute > 59) {
          throw new Error("Minute must be between 0 and 59");
        }
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: opts.hour,
          minute: opts.minute,
          repeats: true,
          channelId: androidChannelId,
        };
        break;
      }

      default: {
        const _exhaustive: never = opts;
        throw new Error(`Unsupported schedule mode: ${(opts as any).mode}`);
      }
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: opts.title,
        body: opts.body,
        data: opts.data,
        sound: Platform.OS === "ios" ? opts.iosSound ?? true : undefined,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    try {
      const uid = getCurrentUserId();
      if (uid) {
        await setDoc(
          doc(db, "users", uid, "scheduledNotifications", id),
          {
            id,
            category: opts.category || "system",
            title: opts.title,
            mode: opts.mode,
            when: opts.mode === "one-shot" ? opts.when.toISOString() : null,
            intervalSeconds: opts.mode === "interval" ? opts.seconds : null,
            intervalRepeats: opts.mode === "interval" ? opts.repeats : null,
            dailyHour: opts.mode === "daily" ? opts.hour : null,
            dailyMinute: opts.mode === "daily" ? opts.minute : null,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn("Failed to persist scheduled notification:", err);
    }

    return id;
  },

  async cancelNotification(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);

    try {
      const uid = getCurrentUserId();
      if (uid) {
        await setDoc(
          doc(db, "users", uid, "scheduledNotifications", id),
          { cancelledAt: serverTimestamp() },
          { merge: true }
        );
      }
    } catch {
      // Non-fatal
    }
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async getAllScheduled(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  },

  async getPushToken(): Promise<string | null> {
    const granted = await this.ensurePermissions();
    if (!granted) return null;

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      return token.data ?? null;
    } catch (err) {
      console.error("Failed to get push token:", err);
      return null;
    }
  },
};

function categoryToChannel(category?: NotificationCategory): string {
  switch (category) {
    case "reminders":
      return "reminders";
    case "stickers":
      return "stickers";
    case "favorites":
      return "favorites";
    case "nudges":
      return "nudges";
    case "system":
    default:
      return "default";
  }
}
