import { db } from "@/config/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { notifyPartner } from "../notification/notifyPartner";
import { useProfileStore } from "@/store/profile";

const NUDGE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export type Nudge = {
  id: string;
  senderUid: string;
  recipientUid: string;
  pairId: string;
  createdAt: number;
};

/**
 * Service for managing romantic "Thinking of You" nudges
 */
export class NudgeService {
  /**
   * Send a nudge to your partner
   * @param customMessage - Optional custom message to include with the nudge
   * @returns Promise that resolves when nudge is sent
   * @throws Error if rate limit is exceeded or no partner is found
   */
  static async sendNudge(customMessage?: string): Promise<void> {
    const profile = useProfileStore.getState().profile;
    const partnerProfile = useProfileStore.getState().partnerProfile;

    if (!profile?.uid) {
      throw new Error("User profile not found");
    }

    if (!partnerProfile?.uid) {
      throw new Error("Partner not found. Please pair with someone first.");
    }

    if (!profile.pairId) {
      throw new Error("Not paired with anyone");
    }

    // Check rate limit
    const canSend = await this.canSendNudge(profile.uid, profile.pairId);
    if (!canSend) {
      throw new Error(
        "Please wait a bit before sending another nudge. Keep it special!"
      );
    }

    // Store nudge in Firestore
    const nudgesRef = collection(db, `pairs/${profile.pairId}/nudges`);
    await addDoc(nudgesRef, {
      senderUid: profile.uid,
      recipientUid: partnerProfile.uid,
      pairId: profile.pairId,
      message: customMessage || null,
      createdAt: serverTimestamp(),
    });

    // Send notification to partner
    const senderName = profile.displayName || "Someone special";
    const notificationBody = customMessage
      ? `${senderName}: "${customMessage}"`
      : `${senderName} is thinking of you right now`;

    await notifyPartner({
      type: "nudge",
      title: "Thinking of you",
      body: notificationBody,
      data: {
        senderUid: profile.uid,
        senderName,
        customMessage: customMessage || "",
      },
    });
  }

  /**
   * Check if user can send a nudge (respects 5-minute cooldown)
   */
  static async canSendNudge(userUid: string, pairId: string): Promise<boolean> {
    const lastNudgeTime = await this.getLastNudgeTime(userUid, pairId);
    if (!lastNudgeTime) return true;

    const now = Date.now();
    const timeSinceLastNudge = now - lastNudgeTime;
    return timeSinceLastNudge >= NUDGE_COOLDOWN_MS;
  }

  /**
   * Get timestamp of last sent nudge
   */
  static async getLastNudgeTime(
    userUid: string,
    pairId: string
  ): Promise<number | null> {
    try {
      const nudgesRef = collection(db, `pairs/${pairId}/nudges`);
      const q = query(
        nudgesRef,
        where("senderUid", "==", userUid),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const lastNudge = snapshot.docs[0].data();
      return lastNudge.createdAt?.toMillis() || null;
    } catch (error) {
      console.error("Error getting last nudge time:", error);
      return null;
    }
  }

  /**
   * Get cooldown remaining in milliseconds
   */
  static async getCooldownRemaining(
    userUid: string,
    pairId: string
  ): Promise<number> {
    const lastNudgeTime = await this.getLastNudgeTime(userUid, pairId);
    if (!lastNudgeTime) return 0;

    const now = Date.now();
    const timeSinceLastNudge = now - lastNudgeTime;
    const remaining = NUDGE_COOLDOWN_MS - timeSinceLastNudge;

    return Math.max(0, remaining);
  }

  /**
   * Get nudge history for the current pair
   */
  static async getNudgeHistory(
    pairId: string,
    limitCount = 50
  ): Promise<Nudge[]> {
    try {
      const nudgesRef = collection(db, `pairs/${pairId}/nudges`);
      const q = query(
        nudgesRef,
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      })) as Nudge[];
    } catch (error) {
      console.error("Error getting nudge history:", error);
      return [];
    }
  }
}
