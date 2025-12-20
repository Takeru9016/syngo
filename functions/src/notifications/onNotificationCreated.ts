import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { sendPushToUser } from "./sendPush";

/**
 * Firestore trigger: When a notification is created directly in Firestore
 * (e.g. from client side for stickers)
 */
export const onNotificationCreated = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      return;
    }

    const data = snapshot.data();
    const notificationId = event.params.notificationId;
    const type = data.type as string;

    // List of types that are handled by other triggers (to avoid duplicate pushes)
    const HANDLED_BY_OTHER_TRIGGERS = [
      "todo_created", // Handled by onTodoCreated
      "todo_reminder", // Handled by onTodoCreated (uses this type in push)
      "favorite_added", // Handled by onFavoriteAdded
    ];

    if (HANDLED_BY_OTHER_TRIGGERS.includes(type)) {
      logger.info(`ℹ️ Notification type '${type}' handled by other triggers. Skipping.`);
      return;
    }

    logger.info(`🔔 Processing new notification: ${notificationId} (${type})`);

    try {
      const recipientUid = data.recipientUid;
      if (!recipientUid) {
        logger.warn("⚠️ Notification missing recipientUid");
        return;
      }

      // Map notification type to preference key
      let preferenceKey = "system";
      if (type === "sticker_sent") preferenceKey = "stickerNotifications";
      else if (type === "nudge") preferenceKey = "nudgeNotifications";
      else if (type === "pair_request" || type === "pair_success") preferenceKey = "pairEvents";

      await sendPushToUser(
        recipientUid,
        {
          title: data.title,
          body: data.body,
          data: {
            ...data.data,
            notificationId,
            type,
          },
        },
        preferenceKey
      );

      logger.info(`✅ Push sent for notification ${notificationId}`);
    } catch (error) {
      logger.error("❌ Error in onNotificationCreated:", error);
    }
  }
);
