import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {
  sendPushToUser,
  createInAppNotification,
  getPartnerUid,
} from "./sendPush";

const db = admin.firestore();

/**
 * Firestore trigger: When a todo is updated
 */
export const onTodoUpdated = onDocumentUpdated(
  "todos/{todoId}",
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    const todoId = event.params.todoId;

    if (!beforeData || !afterData) {
      logger.info("⚠️ No todo data");
      return;
    }

    try {
      const updaterUid = afterData.updatedBy || afterData.createdBy;
      const pairId = afterData.pairId;

      if (!updaterUid || !pairId) {
        logger.info("⚠️ Todo missing updaterUid or pairId");
        return;
      }

      // Get partner UID
      const partnerUid = await getPartnerUid(updaterUid, pairId);
      if (!partnerUid) {
        logger.info("⚠️ Partner not found");
        return;
      }

      // Get updater's name
      const updaterDoc = await db.doc(`users/${updaterUid}`).get();
      const updaterName = updaterDoc.data()?.displayName || "Your partner";

      // Determine what changed
      let notificationTitle = "Todo Updated";
      let notificationBody = "";
      let notificationType = "todo_updated";

      if (!beforeData.isCompleted && afterData.isCompleted) {
        // Todo was completed
        notificationTitle = "Todo Completed ✅";
        notificationBody = `${updaterName} completed: ${afterData.title}`;
        notificationType = "todo_completed";
      } else if (beforeData.title !== afterData.title) {
        // Title changed
        notificationBody = `${updaterName} renamed todo to: ${afterData.title}`;
      } else if (beforeData.dueDate !== afterData.dueDate) {
        // Due date changed
        notificationBody = `${updaterName} updated due date for: ${afterData.title}`;
      } else if (beforeData.priority !== afterData.priority) {
        // Priority changed
        notificationBody = `${updaterName} changed priority for: ${afterData.title}`;
      } else if (beforeData.isCompleted && !afterData.isCompleted) {
        // Todo was uncompleted
        notificationBody = `${updaterName} reopened: ${afterData.title}`;
      } else {
        // General update
        notificationBody = `${updaterName} updated: ${afterData.title}`;
      }

      // Send notification to partner
      await Promise.all([
        sendPushToUser(
          partnerUid,
          {
            title: notificationTitle,
            body: notificationBody,
            data: {
              type: notificationType,
              todoId,
              pairId,
            },
          },
          "todoReminders"
        ),
        createInAppNotification(partnerUid, pairId, {
          type: notificationType,
          title: notificationTitle,
          body: notificationBody,
          data: { todoId },
        }),
      ]);

      logger.info(`✅ Todo update notification sent to partner: ${partnerUid}`);
    } catch (error) {
      logger.error("❌ Error in onTodoUpdated:", error);
    }
  }
);
