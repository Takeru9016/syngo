import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { checkNotificationPreferences } from "../utils/preference";

const db = admin.firestore();

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Send push notification to a user's devices
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

    const tokens: string[] = [];
    devicesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      logger.info(`⚠️ No valid tokens for user: ${uid}`);
      return;
    }

    // Send FCM message
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    logger.info(
      `✅ Push sent to ${uid}: ${response.successCount}/${tokens.length} delivered`
    );

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const batch = db.batch();
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const deviceDoc = devicesSnapshot.docs[idx];
          if (deviceDoc) {
            batch.delete(deviceDoc.ref);
          }
        }
      });
      await batch.commit();
      logger.info(`🧹 Cleaned up ${response.failureCount} invalid tokens`);
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
