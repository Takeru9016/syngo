import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {
  sendPushToUser,
  createInAppNotification,
} from "../notifications/sendPush";

const db = admin.firestore();

/**
 * Scheduled function: Send reminders for todos due soon and overdue (runs every 15 minutes)
 */
export const todoDueReminders = onSchedule(
  "every 15 minutes",
  async (event) => {
    logger.info("⏰ Checking for todos due soon and overdue...");

    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Query todos due within the next hour that haven't been reminded
      const dueSoonSnapshot = await db
        .collection("todos")
        .where("dueDate", ">", admin.firestore.Timestamp.fromDate(now))
        .where(
          "dueDate",
          "<=",
          admin.firestore.Timestamp.fromDate(oneHourFromNow)
        )
        .where("isCompleted", "==", false)
        .where("reminderSent", "==", false)
        .get();

      // Query overdue todos that haven't had overdue notification sent
      const overdueSnapshot = await db
        .collection("todos")
        .where("dueDate", "<", admin.firestore.Timestamp.fromDate(now))
        .where("isCompleted", "==", false)
        .where("overdueNotificationSent", "==", false)
        .get();

      logger.info(
        `📋 Found ${dueSoonSnapshot.size} todos due soon, ${overdueSnapshot.size} overdue`
      );

      // Process due soon reminders
      const dueSoonPromises = dueSoonSnapshot.docs.map(async (todoDoc) => {
        const todoData = todoDoc.data();
        const pairId = todoData.pairId;

        if (!pairId) {
          return;
        }

        // Get pair participants
        const pairDoc = await db.doc(`pairs/${pairId}`).get();
        const participants = pairDoc.data()?.participants || [];

        if (participants.length !== 2) {
          return;
        }

        // Calculate time until due
        const dueDate = todoData.dueDate.toDate();
        const minutesUntilDue = Math.round(
          (dueDate.getTime() - now.getTime()) / 60000
        );

        // Send to both users in the pair
        await Promise.all(
          participants.map(async (uid: string) => {
            await Promise.all([
              sendPushToUser(
                uid,
                {
                  title: "Todo Reminder ⏰",
                  body: `"${todoData.title}" is due in ${minutesUntilDue} minutes`,
                  data: {
                    type: "todo_due_soon",
                    todoId: todoDoc.id,
                    pairId,
                  },
                },
                "todoReminders"
              ),
              createInAppNotification(uid, pairId, {
                type: "todo_due_soon",
                title: "Todo Reminder ⏰",
                body: `"${todoData.title}" is due in ${minutesUntilDue} minutes`,
                data: { todoId: todoDoc.id },
              }),
            ]);
          })
        );

        // Mark as reminded
        await todoDoc.ref.update({ reminderSent: true });
        logger.info(`✅ Due soon reminder sent for todo: ${todoDoc.id}`);
      });

      // Process overdue notifications
      const overduePromises = overdueSnapshot.docs.map(async (todoDoc) => {
        const todoData = todoDoc.data();
        const pairId = todoData.pairId;

        if (!pairId) {
          return;
        }

        // Get pair participants
        const pairDoc = await db.doc(`pairs/${pairId}`).get();
        const participants = pairDoc.data()?.participants || [];

        if (participants.length !== 2) {
          return;
        }

        // Calculate how long overdue
        const dueDate = todoData.dueDate.toDate();
        const minutesOverdue = Math.round(
          (now.getTime() - dueDate.getTime()) / 60000
        );

        let overdueText = "";
        if (minutesOverdue < 60) {
          overdueText = `${minutesOverdue} minutes`;
        } else if (minutesOverdue < 1440) {
          overdueText = `${Math.round(minutesOverdue / 60)} hours`;
        } else {
          overdueText = `${Math.round(minutesOverdue / 1440)} days`;
        }

        // Send to both users in the pair
        await Promise.all(
          participants.map(async (uid: string) => {
            await Promise.all([
              sendPushToUser(
                uid,
                {
                  title: "Todo Overdue ⚠️",
                  body: `"${todoData.title}" is ${overdueText} overdue!`,
                  data: {
                    type: "todo_overdue",
                    todoId: todoDoc.id,
                    pairId,
                  },
                },
                "todoReminders"
              ),
              createInAppNotification(uid, pairId, {
                type: "todo_overdue",
                title: "Todo Overdue ⚠️",
                body: `"${todoData.title}" is ${overdueText} overdue!`,
                data: { todoId: todoDoc.id },
              }),
            ]);
          })
        );

        // Mark overdue notification as sent
        await todoDoc.ref.update({ overdueNotificationSent: true });
        logger.info(`✅ Overdue notification sent for todo: ${todoDoc.id}`);
      });

      await Promise.all([...dueSoonPromises, ...overduePromises]);
      logger.info("✅ Todo reminders completed");
    } catch (error) {
      logger.error("❌ Error in todoDueReminders:", error);
    }
  }
);
