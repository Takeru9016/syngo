import { onDocumentDeleted } from "firebase-functions/v2/firestore";
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
 * Firestore trigger: When a todo/dream is deleted
 */
export const onTodoDeleted = onDocumentDeleted(
  { document: "todos/{todoId}", secrets: [expoAccessToken] },
  async (event) => {
    const todoData = event.data?.data();
    const todoId = event.params.todoId;

    if (!todoData) {
      logger.info("⚠️ No todo data");
      return;
    }

    try {
      const deleterUid = todoData.deletedBy || todoData.createdBy;
      const pairId = todoData.pairId;

      if (!deleterUid || !pairId) {
        logger.info("⚠️ Todo missing deleterUid or pairId");
        return;
      }

      // Get partner UID
      const partnerUid = await getPartnerUid(deleterUid, pairId);
      if (!partnerUid) {
        logger.info("⚠️ Partner not found");
        return;
      }

      // Get deleter's name
      const deleterDoc = await db.doc(`users/${deleterUid}`).get();
      const deleterName = deleterDoc.data()?.displayName || "Your partner";

      // Determine if this is a dream or task
      const isDream = todoData.listType === "dream";
      const title = isDream ? "Dream Removed" : "Todo Deleted 🗑️";
      const body =
        isDream ?
          `${deleterName} removed from bucket list: ${todoData.title}`
        : `${deleterName} removed: ${todoData.title}`;
      const type = isDream ? "dream_deleted" : "todo_deleted";

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
        } deleted notification sent to partner: ${partnerUid}`,
      );
    } catch (error) {
      logger.error("❌ Error in onTodoDeleted:", error);
    }
  },
);
