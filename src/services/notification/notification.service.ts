import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "@/services/auth/auth.service";

// Foreground behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // iOS 15+ foreground behavior
    shouldShowBanner: true, // formerly shouldShowAlert
    shouldShowList: true,   // appear in Notification Center list
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationCategory =
  | "reminders"
  | "stickers"
  | "favorites"
  | "system";

export type ScheduleOptions = {
  title: string;
  body: string;
  data?: Record<string, any>;
  category?: NotificationCategory;
  when: Date; // absolute time
  androidChannelId?: string;
  iosSound?: string | boolean; // true -> default sound
};

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

    const channels: Array<{
      id: string;
      name: string;
      importance: Notifications.AndroidImportance;
      sound?: string;
    }> = [
      {
        id: "default",
        name: "General",
        importance: Notifications.AndroidImportance.DEFAULT,
      },
      {
        id: "reminders",
        name: "Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      },
      {
        id: "stickers",
        name: "Stickers",
        importance: Notifications.AndroidImportance.DEFAULT,
      },
      {
        id: "favorites",
        name: "Favorites",
        importance: Notifications.AndroidImportance.LOW,
      },
      {
        id: "system",
        name: "System",
        importance: Notifications.AndroidImportance.DEFAULT,
      },
    ];

    for (const ch of channels) {
      await Notifications.setNotificationChannelAsync(ch.id, {
        name: ch.name,
        importance: ch.importance,
        lightColor: "#4F46E5",
        vibrationPattern: [0, 200, 150, 200],
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: ch.sound,
      });
    }
  },

  async scheduleLocalNotification(opts: ScheduleOptions): Promise<string> {
    const granted = await this.ensurePermissions();
    if (!granted) throw new Error("Notification permissions not granted");

    const trigger: Notifications.NotificationTriggerInput = {
      date: opts.when,
      channelId:
        Platform.OS === "android"
          ? opts.androidChannelId || categoryToChannel(opts.category)
          : undefined,
      repeats: false,
    };

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

    // Optional record in Firestore
    try {
      const uid = getCurrentUserId();
      if (uid) {
        await setDoc(
          doc(db, "users", uid, "scheduledNotifications", id),
          {
            id,
            category: opts.category || "system",
            title: opts.title,
            when: opts.when.toISOString(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch {
      // non-fatal
    }

    return id;
  },

  async cancelNotification(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async getAllScheduled(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  },

  // Expo push token (dev). In production builds we can also use getDevicePushTokenAsync(Firebase/APNs).
  async getPushToken(): Promise<string | null> {
    const granted = await this.ensurePermissions();
    if (!granted) return null;

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data ?? null;
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
    case "system":
    default:
      return "default";
  }
}
