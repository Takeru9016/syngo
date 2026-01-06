import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "@/services/auth/auth.service";
import { MoodEntry, MoodLevel } from "@/types";
import { useProfileStore } from "@/store/profile";
import { notifyPartner } from "@/services/notification/notifyPartner";

type CreateMoodInput = {
  level: MoodLevel;
  note?: string;
  isPrivate?: boolean;
};

type UpdateMoodInput = {
  level?: MoodLevel;
  note?: string;
  isPrivate?: boolean;
};

function nowMs(): number {
  return Date.now();
}

function requirePairId(): string {
  const profile = useProfileStore.getState().profile;
  const pairId = profile?.pairId;
  if (!pairId) {
    throw new Error("Pair not established");
  }
  return pairId;
}

function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export const MoodService = {
  /**
   * Get user's mood history
   */
  async listByUser(limitCount = 30): Promise<MoodEntry[]> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();
    if (!uid) throw new Error("Not authenticated");

    const q = query(
      collection(db, "pairs", pairId, "moods"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        userId: String(data.userId ?? ""),
        pairId: String(data.pairId ?? pairId),
        level: (data.level as MoodLevel) || 3,
        note: data.note ? String(data.note) : undefined,
        isPrivate: Boolean(data.isPrivate),
        createdAt: Number(data.createdAt ?? 0),
        updatedAt: data.updatedAt ? Number(data.updatedAt) : undefined,
      };
    });
  },

  /**
   * Get partner's shared moods (non-private only)
   */
  async getPartnerMoods(limitCount = 30): Promise<MoodEntry[]> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();
    if (!uid) throw new Error("Not authenticated");

    const q = query(
      collection(db, "pairs", pairId, "moods"),
      where("userId", "!=", uid),
      where("isPrivate", "==", false),
      orderBy("userId"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        userId: String(data.userId ?? ""),
        pairId: String(data.pairId ?? pairId),
        level: (data.level as MoodLevel) || 3,
        note: data.note ? String(data.note) : undefined,
        isPrivate: Boolean(data.isPrivate),
        createdAt: Number(data.createdAt ?? 0),
        updatedAt: data.updatedAt ? Number(data.updatedAt) : undefined,
      };
    });
  },

  /**
   * Get latest mood for both users
   */
  async getLatestMoods(): Promise<{
    mine?: MoodEntry;
    partner?: MoodEntry;
  }> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();
    if (!uid) throw new Error("Not authenticated");

    // Get my latest mood
    const myQuery = query(
      collection(db, "pairs", pairId, "moods"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const mySnap = await getDocs(myQuery);
    const mine = mySnap.docs[0]
      ? ({
          id: mySnap.docs[0].id,
          ...mySnap.docs[0].data(),
        } as MoodEntry)
      : undefined;

    // Get partner's latest shared mood
    const partnerQuery = query(
      collection(db, "pairs", pairId, "moods"),
      where("userId", "!=", uid),
      where("isPrivate", "==", false),
      orderBy("userId"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const partnerSnap = await getDocs(partnerQuery);
    const partner = partnerSnap.docs[0]
      ? ({
          id: partnerSnap.docs[0].id,
          ...partnerSnap.docs[0].data(),
        } as MoodEntry)
      : undefined;

    return { mine, partner };
  },

  /**
   * Get today's mood entry for the current user (if exists)
   */
  async getTodaysMood(): Promise<MoodEntry | null> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();
    if (!uid) throw new Error("Not authenticated");

    const todayStart = getStartOfDay(Date.now());

    const q = query(
      collection(db, "pairs", pairId, "moods"),
      where("userId", "==", uid),
      where("createdAt", ">=", todayStart),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const d = snap.docs[0];
    const data = d.data() as any;

    return {
      id: d.id,
      userId: String(data.userId ?? ""),
      pairId: String(data.pairId ?? pairId),
      level: (data.level as MoodLevel) || 3,
      note: data.note ? String(data.note) : undefined,
      isPrivate: Boolean(data.isPrivate),
      createdAt: Number(data.createdAt ?? 0),
      updatedAt: data.updatedAt ? Number(data.updatedAt) : undefined,
    };
  },

  /**
   * Create new mood entry
   */
  async create(input: CreateMoodInput): Promise<string> {
    const uid = getCurrentUserId();
    if (!uid) throw new Error("Not authenticated");

    const pairId = requirePairId();

    const payload = {
      userId: uid,
      pairId,
      level: input.level,
      note: input.note || null,
      isPrivate: input.isPrivate ?? false, // Default to shared
      createdAt: nowMs(),
      updatedAt: serverTimestamp(),
    };

    try {
      const ref = await addDoc(
        collection(db, "pairs", pairId, "moods"),
        payload
      );

      // Send notification to partner if mood is shared and not sad
      if (!input.isPrivate) {
        const moodEmoji =
          input.level === 1
            ? "😢"
            : input.level === 2
            ? "😔"
            : input.level === 3
            ? "😐"
            : input.level === 4
            ? "🙂"
            : "😊";

        await notifyPartner({
          type: "other",
          title: "Mood Update",
          body: `Your partner is feeling ${moodEmoji}`,
          data: { moodId: ref.id, level: input.level },
        });
      }

      return ref.id;
    } catch (error) {
      console.error("❌ [MoodService.create] Error:", error);
      throw error;
    }
  },

  /**
   * Update mood entry (typically for same-day edits)
   */
  async update(id: string, updates: UpdateMoodInput): Promise<void> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();
    if (!uid) throw new Error("Not authenticated");

    const ref = doc(db, "pairs", pairId, "moods", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        throw new Error("Mood entry not found");
      }

      const data = snap.data() as any;

      // Only allow user to update their own mood
      if (data.userId !== uid) {
        throw new Error("Forbidden: not your mood entry");
      }

      const patch: Record<string, any> = { updatedAt: serverTimestamp() };
      if (updates.level !== undefined) patch.level = updates.level;
      if (updates.note !== undefined) patch.note = updates.note || null;
      if (updates.isPrivate !== undefined) patch.isPrivate = updates.isPrivate;

      await updateDoc(ref, patch);
    } catch (error) {
      console.error("❌ [MoodService.update] Error:", error);
      throw error;
    }
  },

  /**
   * Delete mood entry
   */
  async remove(id: string): Promise<void> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();
    if (!uid) throw new Error("Not authenticated");

    const ref = doc(db, "pairs", pairId, "moods", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return; // Already deleted
      }

      const data = snap.data() as any;

      // Only allow user to delete their own mood
      if (data.userId !== uid) {
        throw new Error("Forbidden: not your mood entry");
      }

      await deleteDoc(ref);
    } catch (error) {
      console.error("❌ [MoodService.remove] Error:", error);
      throw error;
    }
  },
};
