import * as admin from "firebase-admin";
import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/v2/firestore";
import {Expo, ExpoPushMessage, ExpoPushTicket} from "expo-server-sdk";

const db = admin.firestore();
const expo = new Expo();

/**
 * Send push notification via Expo Push Service when a new notification is created
 */
export const sendPushOnNotification = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("⚠️ [sendPushOnNotification] No data");
      return;
    }

    const notification = snapshot.data();
    const recipientUid = notification.recipientUid;

    console.log("📤 [sendPushOnNotification] Sending push to:", recipientUid);

    try {
      // Get all Expo push tokens for recipient
      const devicesSnapshot = await db
        .collection("users")
        .doc(recipientUid)
        .collection("devices")
        .where("pushToken", "!=", null)
        .get();

      if (devicesSnapshot.empty) {
        console.log("⚠️ [sendPushOnNotification] No devices found for:", recipientUid);
        return;
      }

      // Filter for valid Expo Push Tokens
      const tokens = devicesSnapshot.docs
        .map((doc) => doc.data().pushToken)
        .filter((token): token is string => {
          if (!token) return false;
          if (!Expo.isExpoPushToken(token)) {
            console.warn("⚠️ [sendPushOnNotification] Invalid Expo token:", token);
            return false;
          }
          return true;
        });

      if (tokens.length === 0) {
        console.log("⚠️ [sendPushOnNotification] No valid Expo tokens found");
        return;
      }

      console.log(`✅ [sendPushOnNotification] Found ${tokens.length} valid tokens`);

      // Create push messages
      const messages: ExpoPushMessage[] = tokens.map((token) => ({
        to: token,
        sound: "default",
        title: notification.title || "New Notification",
        body: notification.body || "",
        data: {
          type: notification.type || "other",
          notificationId: snapshot.id,
          ...(notification.data || {}),
        },
        badge: 1,
        priority: "high",
        channelId: "default",
      }));

      // Send in chunks (Expo recommends max 100 per request)
      const chunks = expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          console.log(`✅ [sendPushOnNotification] Sent chunk of ${ticketChunk.length} notifications`);
        } catch (error) {
          console.error("❌ [sendPushOnNotification] Chunk send error:", error);
        }
      }

      // Check for errors and collect invalid tokens
      const invalidTokens: string[] = [];
      tickets.forEach((ticket, idx) => {
        if (ticket.status === "error") {
          console.error(`❌ [sendPushOnNotification] Ticket error for token ${tokens[idx]}:`, ticket.message);

          // Check if token is invalid/unregistered
          if (
            ticket.details?.error === "DeviceNotRegistered" ||
            ticket.message?.includes("not registered") ||
            ticket.message?.includes("InvalidCredentials")
          ) {
            invalidTokens.push(tokens[idx]);
          }
        } else if (ticket.status === "ok") {
          console.log(`✅ [sendPushOnNotification] Ticket OK for token ${tokens[idx]}: ${ticket.id}`);
        }
      });

      // Delete invalid tokens from Firestore
      if (invalidTokens.length > 0) {
        console.log(`🗑️ [sendPushOnNotification] Deleting ${invalidTokens.length} invalid tokens`);
        const batch = db.batch();

        for (const token of invalidTokens) {
          const deviceDocs = await db
            .collection("users")
            .doc(recipientUid)
            .collection("devices")
            .where("pushToken", "==", token)
            .get();

          deviceDocs.forEach((doc) => {
            console.log(`🗑️ [sendPushOnNotification] Deleting device: ${doc.id}`);
            batch.delete(doc.ref);
          });
        }

        await batch.commit();
        console.log(`✅ [sendPushOnNotification] Deleted ${invalidTokens.length} invalid tokens`);
      }

      console.log(
        `✅ [sendPushOnNotification] Completed. Sent: ${tickets.length}, Invalid: ${invalidTokens.length}`
      );
    } catch (error) {
      console.error("❌ [sendPushOnNotification] Error:", error);
    }
  }
);

/**
 * Update badge count when notification is marked as read
 */
export const updateBadgeOnRead = onDocumentUpdated(
  "notifications/{notificationId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) {
      console.log("⚠️ [updateBadgeOnRead] No data");
      return;
    }

    // Only proceed if notification was marked as read
    if (before.read || !after.read) {
      return;
    }

    const recipientUid = after.recipientUid;
    console.log("🔔 [updateBadgeOnRead] Updating badge for:", recipientUid);

    try {
      // Count unread notifications
      const unreadSnapshot = await db
        .collection("notifications")
        .where("recipientUid", "==", recipientUid)
        .where("read", "==", false)
        .count()
        .get();

      const unreadCount = unreadSnapshot.data().count;
      console.log(`🔔 [updateBadgeOnRead] Unread count: ${unreadCount}`);

      // Get all device tokens
      const devicesSnapshot = await db
        .collection("users")
        .doc(recipientUid)
        .collection("devices")
        .where("pushToken", "!=", null)
        .get();

      if (devicesSnapshot.empty) {
        console.log("⚠️ [updateBadgeOnRead] No devices found");
        return;
      }

      const tokens = devicesSnapshot.docs
        .map((doc) => doc.data().pushToken)
        .filter((token): token is string => !!token && Expo.isExpoPushToken(token));

      if (tokens.length === 0) {
        console.log("⚠️ [updateBadgeOnRead] No valid tokens");
        return;
      }

      // Send badge update (silent notification)
      const messages: ExpoPushMessage[] = tokens.map((token) => ({
        to: token,
        badge: unreadCount,
        data: {type: "badge_update"},
        priority: "normal",
      }));

      const chunks = expo.chunkPushNotifications(messages);

      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
          console.log(`✅ [updateBadgeOnRead] Sent badge update to ${chunk.length} devices`);
        } catch (error) {
          console.error("❌ [updateBadgeOnRead] Error sending badge update:", error);
        }
      }
    } catch (error) {
      console.error("❌ [updateBadgeOnRead] Error:", error);
    }
  }
);