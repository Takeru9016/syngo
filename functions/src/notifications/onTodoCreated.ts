import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {
  sendPushToUser,
  createInAppNotification,
  getPartnerUid,
} from "./sendPush";

const db = admin.firestore();

/**
 * Firestore trigger: When a todo is created
 */
export const onTodoCreated = onDocumentCreated(
  "todos/{todoId}",
  async (event) => {
    const todoData = event.data?.data();
    const todoId = event.params.todoId;

    if (!todoData) {
      console.log("⚠️ No todo data");
      return;
    }

    try {
      const creatorUid = todoData.createdBy;
      const pairId = todoData.pairId;

      if (!creatorUid || !pairId) {
        console.log("⚠️ Todo missing creatorUid or pairId");
        return;
      }

      // Get partner UID
      const partnerUid = await getPartnerUid(creatorUid, pairId);
      if (!partnerUid) {
        console.log("⚠️ Partner not found");
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
            title: "New Todo Added",
            body: `${creatorName} added: ${todoData.title}`,
            data: {
              type: "todo_reminder",
              todoId,
              pairId,
            },
          },
          "todoReminders"
        ),
        createInAppNotification(partnerUid, pairId, {
          type: "todo_reminder",
          title: "New Todo Added",
          body: `${creatorName} added: ${todoData.title}`,
          data: { todoId },
        }),
      ]);

      console.log(`✅ Todo notification sent to partner: ${partnerUid}`);
    } catch (error) {
      console.error("❌ Error in onTodoCreated:", error);
    }
  }
);
