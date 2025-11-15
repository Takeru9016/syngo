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
import { AppNotification, AppNotificationType } from "@/types";

type CreateNotificationInput = {
  recipientUid: string;
  type: AppNotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  pairId?: string | null;
};

function nowMs(): number {
  return Date.now();
}

export type SendToPartnerInput = {
  type: Extract<
    AppNotificationType,
    "sticker_sent" | "favorite_added" | "todo_created" | "todo_reminder"
  >;
  title: string;
  body: string;
  data?: Record<string, any>;
};

export const AppNotificationService = {
  /**
   * List notifications for the current user
   */
  async listForCurrentUser(): Promise<AppNotification[]> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error(
        "❌ [AppNotificationService.listForCurrentUser] Not authenticated"
      );
      throw new Error("Not authenticated");
    }

    console.log(
      "📋 [AppNotificationService.listForCurrentUser] Querying notifications for uid:",
      uid
    );

    const q = query(
      collection(db, "notifications"),
      where("recipientUid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const snap = await getDocs(q);
    console.log(
      "📋 [AppNotificationService.listForCurrentUser] Found",
      snap.docs.length,
      "notifications"
    );

    const notifications = snap.docs.map((d) => {
      const data = d.data() as any;
      console.log(
        "📄 [AppNotificationService.listForCurrentUser] Notification doc:",
        d.id,
        data
      );

      const notification: AppNotification = {
        id: d.id,
        type: String(data.type ?? "other") as AppNotificationType,
        title: String(data.title ?? ""),
        body: String(data.body ?? ""),
        senderUid: data.senderUid ? String(data.senderUid) : undefined,
        recipientUid: String(data.recipientUid ?? ""),
        pairId: data.pairId ?? null,
        read: Boolean(data.read ?? false),
        createdAt: Number(data.createdAt ?? 0),
        data: data.data || {},
      };
      return notification;
    });

    return notifications;
  },

  /**
   * Create a notification for a partner
   */
  async create(input: CreateNotificationInput): Promise<string> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("❌ [AppNotificationService.create] Not authenticated");
      throw new Error("Not authenticated");
    }

    const payload = {
      type: input.type,
      title: input.title,
      body: input.body,
      senderUid: uid,
      recipientUid: input.recipientUid,
      pairId: input.pairId ?? null,
      read: false,
      createdAt: nowMs(),
      updatedAt: serverTimestamp(),
      data: input.data || {},
    };

    console.log(
      "➕ [AppNotificationService.create] Creating notification with payload:",
      payload
    );

    try {
      const ref = await addDoc(collection(db, "notifications"), payload);
      console.log(
        "✅ [AppNotificationService.create] Created notification with ID:",
        ref.id
      );
      return ref.id;
    } catch (error) {
      console.error("❌ [AppNotificationService.create] Error:", error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("❌ [AppNotificationService.markAsRead] Not authenticated");
      throw new Error("Not authenticated");
    }

    console.log(
      "✏️ [AppNotificationService.markAsRead] Marking notification as read:",
      id
    );

    const ref = doc(db, "notifications", id);

    try {
      await updateDoc(ref, {
        read: true,
        updatedAt: serverTimestamp(),
      });
      console.log(
        "✅ [AppNotificationService.markAsRead] Successfully marked as read:",
        id
      );
    } catch (error) {
      console.error("❌ [AppNotificationService.markAsRead] Error:", error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(): Promise<void> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error(
        "❌ [AppNotificationService.markAllAsRead] Not authenticated"
      );
      throw new Error("Not authenticated");
    }

    console.log(
      "✏️ [AppNotificationService.markAllAsRead] Marking all notifications as read for uid:",
      uid
    );

    const q = query(
      collection(db, "notifications"),
      where("recipientUid", "==", uid),
      where("read", "==", false)
    );

    try {
      const snap = await getDocs(q);
      console.log(
        "📋 [AppNotificationService.markAllAsRead] Found",
        snap.docs.length,
        "unread notifications"
      );

      const promises = snap.docs.map((d) =>
        updateDoc(doc(db, "notifications", d.id), {
          read: true,
          updatedAt: serverTimestamp(),
        })
      );

      await Promise.all(promises);
      console.log(
        "✅ [AppNotificationService.markAllAsRead] Successfully marked all as read"
      );
    } catch (error) {
      console.error("❌ [AppNotificationService.markAllAsRead] Error:", error);
      throw error;
    }
  },

  /**
   * Delete a notification
   */
  async remove(id: string): Promise<void> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("❌ [AppNotificationService.remove] Not authenticated");
      throw new Error("Not authenticated");
    }

    console.log(
      "🗑️ [AppNotificationService.remove] Deleting notification:",
      id
    );

    const ref = doc(db, "notifications", id);

    try {
      await deleteDoc(ref);
      console.log(
        "✅ [AppNotificationService.remove] Successfully deleted notification:",
        id
      );
    } catch (error) {
      console.error("❌ [AppNotificationService.remove] Error:", error);
      throw error;
    }
  },

  /**
   * Delete all notifications for current user
   */
  async clearAll(): Promise<void> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("❌ [AppNotificationService.clearAll] Not authenticated");
      throw new Error("Not authenticated");
    }

    console.log(
      "🗑️ [AppNotificationService.clearAll] Clearing all notifications for uid:",
      uid
    );

    const q = query(
      collection(db, "notifications"),
      where("recipientUid", "==", uid)
    );

    try {
      const snap = await getDocs(q);
      console.log(
        "📋 [AppNotificationService.clearAll] Found",
        snap.docs.length,
        "notifications to delete"
      );

      const promises = snap.docs.map((d) =>
        deleteDoc(doc(db, "notifications", d.id))
      );

      await Promise.all(promises);
      console.log(
        "✅ [AppNotificationService.clearAll] Successfully cleared all notifications"
      );
    } catch (error) {
      console.error("❌ [AppNotificationService.clearAll] Error:", error);
      throw error;
    }
  },

  /**
   * High-level helper: send a notification to the current user's partner.
   * Requires that the current user has a pairId on their profile and that
   * pairs/{pairId} exists with participants: [uid1, uid2].
   */
  async sendToPartner(input: SendToPartnerInput): Promise<string> {
    const currentUid = getCurrentUserId();
    if (!currentUid) {
      console.error(
        "❌ [AppNotificationService.sendToPartner] Not authenticated"
      );
      throw new Error("Not authenticated");
    }

    console.log(
      "📨 [AppNotificationService.sendToPartner] Resolving partner for uid:",
      currentUid
    );

    // 1. Load current user's profile to get pairId
    const userProfileRef = doc(db, "users", currentUid);
    const userProfileSnap = await getDoc(userProfileRef);
    if (!userProfileSnap.exists()) {
      console.error(
        "❌ [AppNotificationService.sendToPartner] User profile not found for uid:",
        currentUid
      );
      throw new Error("User profile not found");
    }

    const userProfileData = userProfileSnap.data() as {
      pairId?: string | null;
    };
    const pairId = userProfileData.pairId ?? null;
    if (!pairId) {
      console.error(
        "❌ [AppNotificationService.sendToPartner] User is not paired, cannot send to partner"
      );
      throw new Error("User is not paired");
    }

    console.log(
      "📨 [AppNotificationService.sendToPartner] Found pairId:",
      pairId
    );

    // 2. Load pair doc to resolve partner uid
    const pairRef = doc(db, "pairs", pairId);
    const pairSnap = await getDoc(pairRef);
    if (!pairSnap.exists()) {
      console.error(
        "❌ [AppNotificationService.sendToPartner] Pair document not found for pairId:",
        pairId
      );
      throw new Error("Pair not found");
    }

    const pairData = pairSnap.data() as { participants: [string, string] };
    const [uid1, uid2] = pairData.participants;
    const recipientUid = uid1 === currentUid ? uid2 : uid1;

    console.log(
      "📨 [AppNotificationService.sendToPartner] Sending notification to partner:",
      {
        currentUid,
        recipientUid,
        pairId,
        type: input.type,
      }
    );

    // 3. Delegate to create()
    return this.create({
      type: input.type,
      title: input.title,
      body: input.body,
      recipientUid,
      pairId,
      data: input.data,
    });
  },
};
