import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {
  sendPushToUser,
  createInAppNotification,
  getPartnerUid,
} from "./sendPush";

const db = admin.firestore();

// Mood emoji mapping
const MOOD_EMOJIS: Record<number, string> = {
  1: "😢", // Very sad
  2: "😔", // Sad
  3: "😐", // Neutral
  4: "🙂", // Happy
  5: "😊", // Very happy
};

const MOOD_LABELS: Record<number, string> = {
  1: "Struggling",
  2: "Down",
  3: "Okay",
  4: "Good",
  5: "Great",
};

/**
 * Firestore trigger: When a mood entry is created
 * Sends notification to partner with mood emoji
 */
export const onMoodUpdated = onDocumentCreated(
  "moodEntries/{moodId}",
  async (event) => {
    const moodData = event.data?.data();
    const moodId = event.params.moodId;

    if (!moodData) {
      logger.info("⚠️ No mood data");
      return;
    }

    // Don't notify for private moods
    if (moodData.isPrivate) {
      logger.info("ℹ️ Mood is private, skipping notification");
      return;
    }

    try {
      const creatorUid = moodData.userId;
      const pairId = moodData.pairId;

      if (!creatorUid || !pairId) {
        logger.info("⚠️ Mood missing userId or pairId");
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

      // Get mood details
      const moodLevel = moodData.level as number;
      const moodEmoji = MOOD_EMOJIS[moodLevel] || "❓";
      const moodLabel = MOOD_LABELS[moodLevel] || "Unknown";
      const moodNote = moodData.note || "";

      // Build notification body
      let body = `${creatorName} is feeling ${moodLabel.toLowerCase()}`;
      if (moodNote) {
        body += `: "${moodNote.substring(0, 50)}${
          moodNote.length > 50 ? "..." : ""
        }"`;
      }

      // Send notification to partner with emoji
      await Promise.all([
        sendPushToUser(
          partnerUid,
          {
            title: `${moodEmoji} Mood Update`,
            body,
            data: {
              type: "mood_updated",
              moodId,
              pairId,
            },
            richContent: {
              type: "mood",
              moodEmoji,
              moodLabel,
            },
          },
          "system" // Using system channel for mood notifications
        ),
        createInAppNotification(partnerUid, pairId, {
          type: "mood_updated",
          title: `${moodEmoji} Mood Update`,
          body,
          data: {
            moodId,
            moodLevel: String(moodLevel),
            moodEmoji,
            moodLabel,
            moodNote,
          },
        }),
      ]);

      logger.info(`✅ Mood notification sent to partner: ${partnerUid}`);
    } catch (error) {
      logger.error("❌ Error in onMoodUpdated:", error);
    }
  }
);
