import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {
  sendPushToUser,
  createInAppNotification,
  getPartnerUid,
} from "./sendPush";

const db = admin.firestore();

/**
 * Firestore trigger: When a favorite is added
 */
export const onFavoriteAdded = onDocumentCreated(
  "favorites/{favoriteId}",
  async (event) => {
    const favoriteData = event.data?.data();
    const favoriteId = event.params.favoriteId;

    if (!favoriteData) {
      logger.info("⚠️ No favorite data");
      return;
    }

    try {
      const creatorUid = favoriteData.createdBy;
      const pairId = favoriteData.pairId;

      if (!creatorUid || !pairId) {
        logger.info("⚠️ Favorite missing creatorUid or pairId");
        return;
      }

      // Get partner UID
      const partnerUid = await getPartnerUid(creatorUid, pairId);
      if (!partnerUid) {
        logger.info("⚠️ Partner not found");
        return;
      }

      // Get creator's name
      const creatorDoc = await db.doc(`users/${creatorUid}`).get();
      const creatorName = creatorDoc.data()?.displayName || "Your partner";

      // Send notification to partner
      await Promise.all([
        sendPushToUser(
          partnerUid,
          {
            title: "New Favorite Added ⭐",
            body: `${creatorName} added: ${favoriteData.title}`,
            data: {
              type: "favorite_added",
              favoriteId,
              pairId,
            },
          },
          "favoriteUpdates"
        ),
        createInAppNotification(partnerUid, pairId, {
          type: "favorite_added",
          title: "New Favorite Added ⭐",
          body: `${creatorName} added: ${favoriteData.title}`,
          data: { favoriteId },
        }),
      ]);

      logger.info(`✅ Favorite notification sent to partner: ${partnerUid}`);
    } catch (error) {
      logger.error("❌ Error in onFavoriteAdded:", error);
    }
  }
);
