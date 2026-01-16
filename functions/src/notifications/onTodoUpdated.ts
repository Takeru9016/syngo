import { onDocumentUpdated } from "firebase-functions/v2/firestore";
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
 * Firestore trigger: When a todo/dream is updated
 */
export const onTodoUpdated = onDocumentUpdated(
  { document: "todos/{todoId}", secrets: [expoAccessToken] },
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

      // Determine if this is a dream or task
      const isDream = afterData.listType === "dream";
      const itemLabel = isDream ? "dream" : "todo";
      const categoryEmoji = getCategoryEmoji(afterData.category);

      // Determine what changed
      let notificationTitle = isDream ? "Dream Updated" : "Todo Updated";
      let notificationBody = "";
      let notificationType = isDream ? "dream_updated" : "todo_updated";

      if (!beforeData.isCompleted && afterData.isCompleted) {
        // Item was completed
        if (isDream) {
          notificationTitle = `Dream Achieved! ${categoryEmoji}`;
          notificationBody = `${updaterName} achieved: ${afterData.title}`;
          notificationType = "dream_achieved";
        } else {
          notificationTitle = "Todo Completed ✅";
          notificationBody = `${updaterName} completed: ${afterData.title}`;
          notificationType = "todo_completed";
        }
      } else if (beforeData.title !== afterData.title) {
        // Title changed
        notificationBody = `${updaterName} renamed ${itemLabel} to: ${afterData.title}`;
      } else if (beforeData.dueDate !== afterData.dueDate) {
        // Due date changed
        notificationBody = `${updaterName} updated ${
          isDream ? "target date" : "due date"
        } for: ${afterData.title}`;
      } else if (beforeData.priority !== afterData.priority) {
        // Priority changed
        notificationBody = `${updaterName} changed ${
          isDream ? "importance" : "priority"
        } for: ${afterData.title}`;
      } else if (beforeData.isCompleted && !afterData.isCompleted) {
        // Item was uncompleted
        notificationBody = `${updaterName} reopened: ${afterData.title}`;
      } else if (isDream && beforeData.category !== afterData.category) {
        // Dream category changed
        notificationBody = `${updaterName} changed category for: ${afterData.title}`;
      } else {
        // General update (skip subtask-only changes to avoid notification spam)
        const beforeSubtasks = JSON.stringify(beforeData.subtasks || []);
        const afterSubtasks = JSON.stringify(afterData.subtasks || []);
        if (beforeSubtasks !== afterSubtasks) {
          // Subtask change - don't send notification
          logger.info("⏭️ Skipping notification for subtask-only change");
          return;
        }
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
          "todoReminders",
        ),
        createInAppNotification(partnerUid, pairId, {
          type: notificationType,
          title: notificationTitle,
          body: notificationBody,
          data: { todoId },
        }),
      ]);

      logger.info(
        `✅ ${
          isDream ? "Dream" : "Todo"
        } update notification sent to partner: ${partnerUid}`,
      );
    } catch (error) {
      logger.error("❌ Error in onTodoUpdated:", error);
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
