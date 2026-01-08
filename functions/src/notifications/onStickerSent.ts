import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {
  sendPushToUser,
  createInAppNotification,
  getPartnerUid,
} from "./sendPush";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Callable function: Send sticker to partner
 */
export const onStickerSent = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const { stickerId, stickerName, stickerUrl } = request.data;
  const senderUid = request.auth.uid;

  if (!stickerId || !stickerName) {
    throw new HttpsError("invalid-argument", "Sticker data required");
  }

  try {
    // Get sender's pairId
    const senderDoc = await db.doc(`users/${senderUid}`).get();
    const pairId = senderDoc.data()?.pairId;

    if (!pairId) {
      throw new HttpsError("failed-precondition", "User is not paired");
    }

    // Get partner UID
    const partnerUid = await getPartnerUid(senderUid, pairId);
    if (!partnerUid) {
      throw new HttpsError("not-found", "Partner not found");
    }

    // Get sender's name
    const senderName = senderDoc.data()?.displayName || "Your partner";

    // Get sticker description if available
    const { stickerDescription } = request.data;

    // Send notification to partner with rich content
    await Promise.all([
      sendPushToUser(
        partnerUid,
        {
          title: "Sticker from your partner! 🎨",
          body: `${senderName} sent you: ${stickerName}`,
          subtitle: stickerDescription || undefined,
          imageUrl: stickerUrl || undefined,
          data: {
            type: "sticker_sent",
            stickerId,
            stickerUrl: stickerUrl || "",
            pairId,
          },
          richContent: {
            type: "sticker",
            imageUrl: stickerUrl || undefined,
            stickerName,
            stickerDescription: stickerDescription || undefined,
          },
        },
        "stickerNotifications"
      ),
      createInAppNotification(partnerUid, pairId, {
        type: "sticker_sent",
        title: "Sticker from your partner! 🎨",
        body: `${senderName} sent you: ${stickerName}`,
        data: { stickerId, stickerUrl, stickerName, stickerDescription },
      }),
    ]);

    logger.info(`✅ Sticker notification sent to partner: ${partnerUid}`);

    return { success: true };
  } catch (error: any) {
    logger.error("❌ Error in onStickerSent:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", error.message);
  }
});
