import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {
  sendPushToUser,
  createInAppNotification,
  getPartnerUid,
} from "./sendPush";
import { expoAccessToken } from "../index";

const db = admin.firestore();

/**
 * Firestore trigger: When a todo/dream is created
 */
export const onTodoCreated = onDocumentCreated(
  { document: "todos/{todoId}", secrets: [expoAccessToken] },
  async (event) => {
    const todoData = event.data?.data();
    const todoId = event.params.todoId;

    if (!todoData) {
      logger.info("⚠️ No todo data");
      return;
    }

    try {
      const creatorUid = todoData.createdBy;
      const pairId = todoData.pairId;

      if (!creatorUid || !pairId) {
        logger.info("⚠️ Todo missing creatorUid or pairId");
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

      // Determine if this is a dream or task
      const isDream = todoData.listType === "dream";
      const categoryEmoji = getCategoryEmoji(todoData.category);

      const title =
        isDream ? `New Dream Added ${categoryEmoji}` : "New Task Added";
      const body =
        isDream ?
          `${creatorName} added to bucket list: ${todoData.title}`
        : `${creatorName} added: ${todoData.title}`;
      const type = isDream ? "dream_created" : "todo_reminder";

      // Send notification to partner
      await Promise.all([
        sendPushToUser(
          partnerUid,
          {
            title,
            body,
            data: {
              type,
              todoId,
              pairId,
            },
          },
          "todoReminders",
        ),
        createInAppNotification(partnerUid, pairId, {
          type,
          title,
          body,
          data: { todoId },
        }),
      ]);

      logger.info(
        `✅ ${
          isDream ? "Dream" : "Todo"
        } notification sent to partner: ${partnerUid}`,
      );
    } catch (error) {
      logger.error("❌ Error in onTodoCreated:", error);
    }
  },
);

/**
 * Get emoji for dream category
 */
function getCategoryEmoji(category?: string): string {
  switch (category) {
    case "travel":
      return "✈️";
    case "food":
      return "🍕";
    case "adventure":
      return "🎢";
    case "together":
      return "💕";
    default:
      return "✨";
  }
}
