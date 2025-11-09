import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Check if user has enabled a specific notification type
 */
export async function checkNotificationPreferences(
  uid: string,
  notificationType: string
): Promise<boolean> {
  try {
    const userDoc = await db.doc(`users/${uid}`).get();
    const preferences = userDoc.data()?.notificationPreferences;

    if (!preferences) {
      // Default: all enabled
      return true;
    }

    // Check master toggle
    if (preferences.enabled === false) {
      return false;
    }

    // Check specific type
    switch (notificationType) {
      case "todoReminders":
        return preferences.todoReminders !== false;
      case "stickerNotifications":
        return preferences.stickerNotifications !== false;
      case "favoriteUpdates":
        return preferences.favoriteUpdates !== false;
      case "pairEvents":
        return preferences.pairEvents !== false;
      default:
        return true;
    }
  } catch (error) {
    console.error("Error checking notification preferences:", error);
    return true; // Default to enabled on error
  }
}

/**
 * Check if user is in quiet hours
 */
export async function isInQuietHours(uid: string): Promise<boolean> {
  try {
    const userDoc = await db.doc(`users/${uid}`).get();
    const preferences = userDoc.data()?.notificationPreferences;

    if (!preferences || !preferences.quietHoursEnabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const start = preferences.quietHoursStart || "22:00";
    const end = preferences.quietHoursEnd || "08:00";

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }

    // Handle same-day quiet hours (e.g., 14:00 - 16:00)
    return currentTime >= start && currentTime <= end;
  } catch (error) {
    console.error("Error checking quiet hours:", error);
    return false;
  }
}
