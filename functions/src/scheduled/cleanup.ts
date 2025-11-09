import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Scheduled function: Clean up expired data (runs every hour)
 */
export const scheduledCleanup = onSchedule("every 1 hours", async (event) => {
  console.log("🧹 Starting scheduled cleanup...");

  try {
    const now = admin.firestore.Timestamp.now();
    const thirtyDaysAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    // 1. Delete expired pairing codes
    const expiredCodes = await db
      .collection("pairCodes")
      .where("expiresAt", "<", now)
      .get();

    if (!expiredCodes.empty) {
      const batch = db.batch();
      expiredCodes.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Deleted ${expiredCodes.size} expired pairing codes`);
    }

    // 2. Delete old notifications (older than 30 days)
    const oldNotifications = await db
      .collection("notifications")
      .where("createdAt", "<", thirtyDaysAgo)
      .limit(500)
      .get();

    if (!oldNotifications.empty) {
      const batch = db.batch();
      oldNotifications.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Deleted ${oldNotifications.size} old notifications`);
    }

    // 3. Clean up inactive device tokens (no activity in 90 days)
    const ninetyDaysAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );

    const usersSnapshot = await db.collection("users").get();
    let deletedTokens = 0;

    for (const userDoc of usersSnapshot.docs) {
      const devicesSnapshot = await db
        .collection(`users/${userDoc.id}/devices`)
        .where("lastActive", "<", ninetyDaysAgo)
        .get();

      if (!devicesSnapshot.empty) {
        const batch = db.batch();
        devicesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        deletedTokens += devicesSnapshot.size;
      }
    }

    if (deletedTokens > 0) {
      console.log(`✅ Deleted ${deletedTokens} inactive device tokens`);
    }

    console.log("✅ Scheduled cleanup completed");
  } catch (error) {
    console.error("❌ Error in scheduled cleanup:", error);
  }
});
