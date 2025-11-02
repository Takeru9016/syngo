import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

const db = admin.firestore();

/**
 * Clean up expired pair codes
 * Runs every hour
 */
export const cleanupExpiredCodes = onSchedule("every 1 hours", async () => {
  console.log("🧹 [cleanupExpiredCodes] Starting cleanup");

  try {
    const now = Date.now();
    const expiredCodes = await db
      .collection("pairCodes")
      .where("expiresAt", "<", now)
      .where("used", "==", false)
      .limit(500)
      .get();

    if (expiredCodes.empty) {
      console.log("✅ [cleanupExpiredCodes] No expired codes");
      return;
    }

    const batch = db.batch();
    expiredCodes.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(
      "✅ [cleanupExpiredCodes] Deleted:",
      expiredCodes.size,
      "codes"
    );
  } catch (error) {
    console.error("❌ [cleanupExpiredCodes] Error:", error);
  }
});
