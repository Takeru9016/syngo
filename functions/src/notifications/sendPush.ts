import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { checkNotificationPreferences } from "../utils/preference";

const db = admin.firestore();

// Expo Push API endpoint
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export interface PushPayload {
  title: string;
  body: string;
  subtitle?: string; // iOS subtitle support
  data?: Record<string, string>;
  // Rich notification content
  imageUrl?: string; // For stickers, favorites with images
  richContent?: {
    type: "sticker" | "favorite" | "mood" | "default";
    imageUrl?: string;
    stickerName?: string;
    stickerDescription?: string;
    favoriteTitle?: string;
    favoriteDescription?: string;
    moodEmoji?: string;
    moodLabel?: string;
  };
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  subtitle?: string;
  data?: Record<string, string>;
  sound?: "default" | null;
  channelId?: string;
  priority?: "default" | "normal" | "high";
  badge?: number;
  _contentAvailable?: boolean; // For iOS background processing
}

interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

/**
 * Send push notification to a user's devices using Expo Push API
 */
export async function sendPushToUser(
  uid: string,
  payload: PushPayload,
  notificationType?: string
): Promise<void> {
  try {
    // Check notification preferences
    if (notificationType) {
      const allowed = await checkNotificationPreferences(uid, notificationType);
      if (!allowed) {
        logger.info(
          `⏭️ Notification blocked by user preferences: ${uid} - ${notificationType}`
        );
        return;
      }
    }

    // Get user's device tokens
    const devicesSnapshot = await db.collection(`users/${uid}/devices`).get();

    if (devicesSnapshot.empty) {
      logger.info(`⚠️ No devices found for user: ${uid}`);
      return;
    }

    const tokens: { token: string; docId: string }[] = [];
    devicesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.pushToken) {
        tokens.push({ token: data.pushToken, docId: doc.id });
      }
    });

    if (tokens.length === 0) {
      logger.info(`⚠️ No valid tokens for user: ${uid}`);
      return;
    }

    // Determine Android channel based on notification type
    let channelId = "default";
    if (notificationType === "stickerNotifications") channelId = "stickers";
    else if (notificationType === "todoReminders") channelId = "reminders";
    else if (notificationType === "favoriteUpdates") channelId = "favorites";
    else if (notificationType === "nudgeNotifications") channelId = "nudges";

    // Build rich data payload with image URLs for client-side handling
    const richData: Record<string, string> = {
      ...(payload.data || {}),
    };

    // Include image URL in data for client-side rich notification handling
    if (payload.imageUrl) {
      richData.imageUrl = payload.imageUrl;
    }

    // Include rich content as JSON for structured data
    if (payload.richContent) {
      richData.richContent = JSON.stringify(payload.richContent);
    }

    // Build Expo push messages
    const messages: ExpoPushMessage[] = tokens.map(({ token }) => ({
      to: token,
      title: payload.title,
      body: payload.body,
      subtitle: payload.subtitle,
      data: richData,
      sound: "default",
      channelId,
      priority: "high",
      _contentAvailable: !!payload.imageUrl, // Enable background processing for images
    }));

    // Send via Expo Push API
    // Note: EXPO_ACCESS_TOKEN is required for production push notifications
    // Set it via: firebase functions:secrets:set EXPO_ACCESS_TOKEN
    const expoAccessToken = process.env.EXPO_ACCESS_TOKEN;
    
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    };
    
    // Add authorization header if access token is available
    if (expoAccessToken) {
      headers["Authorization"] = `Bearer ${expoAccessToken}`;
    } else {
      logger.warn("⚠️ EXPO_ACCESS_TOKEN not set - push notifications may fail in production");
    }
    
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      throw new Error(
        `Expo push failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    const tickets: ExpoPushTicket[] = result.data || [];

    let successCount = 0;
    let failureCount = 0;
    const tokensToRemove: string[] = [];

    // Process response tickets
    tickets.forEach((ticket, idx) => {
      if (ticket.status === "ok") {
        successCount++;
      } else {
        failureCount++;
        const errorType = ticket.details?.error;

        // Remove invalid tokens
        if (
          errorType === "DeviceNotRegistered" ||
          errorType === "InvalidCredentials"
        ) {
          tokensToRemove.push(tokens[idx].docId);
          logger.warn(`🗑️ Token expired for device: ${tokens[idx].docId}`);
        } else {
          logger.warn(
            `⚠️ Push failed for device ${tokens[idx].docId}: ${ticket.message}`
          );
        }
      }
    });

    logger.info(
      `✅ Push sent to ${uid}: ${successCount}/${tokens.length} delivered`
    );

    // Clean up invalid tokens
    if (tokensToRemove.length > 0) {
      const batch = db.batch();
      tokensToRemove.forEach((docId) => {
        batch.delete(db.doc(`users/${uid}/devices/${docId}`));
      });
      await batch.commit();
      logger.info(`🧹 Cleaned up ${tokensToRemove.length} invalid tokens`);
    }
  } catch (error) {
    logger.error(`❌ Error sending push to ${uid}:`, error);
  }
}

/**
 * Create in-app notification
 */
export async function createInAppNotification(
  recipientUid: string,
  pairId: string,
  notification: {
    type: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }
): Promise<void> {
  try {
    await db.collection("notifications").add({
      recipientUid,
      pairId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`✅ In-app notification created for ${recipientUid}`);
  } catch (error) {
    logger.error(`❌ Error creating in-app notification:`, error);
  }
}

/**
 * Get partner UID from pairId
 */
export async function getPartnerUid(
  currentUid: string,
  pairId: string
): Promise<string | null> {
  try {
    const pairDoc = await db.doc(`pairs/${pairId}`).get();
    if (!pairDoc.exists) {
      return null;
    }

    const participants = pairDoc.data()?.participants || [];
    return participants.find((uid: string) => uid !== currentUid) || null;
  } catch (error) {
    logger.error("Error getting partner UID:", error);
    return null;
  }
}
