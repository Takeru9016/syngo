import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import {
  sendPushToUser,
  createInAppNotification,
} from "../notifications/sendPush";

const db = admin.firestore();

/**
 * Scheduled function: Send reminders for todos due soon (runs every 15 minutes)
 */
export const todoDueReminders = onSchedule(
  "every 15 minutes",
  async (event) => {
    console.log("⏰ Checking for todos due soon...");

    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Query todos due within the next hour that haven't been reminded
      const todosSnapshot = await db
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

      if (todosSnapshot.empty) {
        console.log("✅ No todos due soon");
        return;
      }

      console.log(`📋 Found ${todosSnapshot.size} todos due soon`);

      // Send reminders
      const promises = todosSnapshot.docs.map(async (todoDoc) => {
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
                    type: "todo_reminder",
                    todoId: todoDoc.id,
                    pairId,
                  },
                },
                "todoReminders"
              ),
              createInAppNotification(uid, pairId, {
                type: "todo_reminder",
                title: "Todo Reminder ⏰",
                body: `"${todoData.title}" is due in ${minutesUntilDue} minutes`,
                data: { todoId: todoDoc.id },
              }),
            ]);
          })
        );

        // Mark as reminded
        await todoDoc.ref.update({ reminderSent: true });
        console.log(`✅ Reminder sent for todo: ${todoDoc.id}`);
      });

      await Promise.all(promises);
      console.log("✅ Todo reminders completed");
    } catch (error) {
      console.error("❌ Error in todoDueReminders:", error);
    }
  }
);
