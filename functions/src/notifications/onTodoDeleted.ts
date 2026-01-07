import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {
  sendPushToUser,
  createInAppNotification,
  getPartnerUid,
} from "./sendPush";

const db = admin.firestore();

/**
 * Firestore trigger: When a todo is deleted
 */
export const onTodoDeleted = onDocumentDeleted(
  "todos/{todoId}",
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

      // Send notification to partner
      await Promise.all([
        sendPushToUser(
          partnerUid,
          {
            title: "Todo Deleted 🗑️",
            body: `${deleterName} removed: ${todoData.title}`,
            data: {
              type: "todo_deleted",
              todoId,
              pairId,
            },
          },
          "todoReminders"
        ),
        createInAppNotification(partnerUid, pairId, {
          type: "todo_deleted",
          title: "Todo Deleted 🗑️",
          body: `${deleterName} removed: ${todoData.title}`,
          data: { todoId },
        }),
      ]);

      logger.info(
        `✅ Todo deleted notification sent to partner: ${partnerUid}`
      );
    } catch (error) {
      logger.error("❌ Error in onTodoDeleted:", error);
    }
  }
);
