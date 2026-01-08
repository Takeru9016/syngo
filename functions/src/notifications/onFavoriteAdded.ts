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

      // Get description and image from favorite data
      const favoriteDescription = favoriteData.description || "";
      const favoriteImageUrl = favoriteData.imageUrl || undefined;
      const favoriteCategory = favoriteData.category || "other";

      // Send notification to partner with rich content
      await Promise.all([
        sendPushToUser(
          partnerUid,
          {
            title: "New Favorite Added ⭐",
            body: `${creatorName} added: ${favoriteData.title}`,
            subtitle: favoriteDescription || undefined,
            imageUrl: favoriteImageUrl,
            data: {
              type: "favorite_added",
              favoriteId,
              pairId,
            },
            richContent: {
              type: "favorite",
              imageUrl: favoriteImageUrl,
              favoriteTitle: favoriteData.title,
              favoriteDescription: favoriteDescription || undefined,
            },
          },
          "favoriteUpdates"
        ),
        createInAppNotification(partnerUid, pairId, {
          type: "favorite_added",
          title: "New Favorite Added ⭐",
          body: `${creatorName} added: ${favoriteData.title}`,
          data: {
            favoriteId,
            favoriteTitle: favoriteData.title,
            favoriteDescription,
            favoriteImageUrl,
            favoriteCategory,
          },
        }),
      ]);

      logger.info(`✅ Favorite notification sent to partner: ${partnerUid}`);
    } catch (error) {
      logger.error("❌ Error in onFavoriteAdded:", error);
    }
  }
);
