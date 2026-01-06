import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { AppNotificationService } from "@/services/notification/notification.service";
import { AppNotification } from "@/types";
import { getCurrentUserId } from "@/services/auth/auth.service";
import { useProfileStore } from "@/store/profile";
import { useNotificationStore } from "@/store/notification";

const key = (uid?: string) => ["app-notifications", uid || "none"] as const;

// Global listener ref to prevent multiple listeners
let globalUnsubscribe: Unsubscribe | null = null;
let listenerUid: string | null = null;

export function useAppNotifications() {
  const uid = getCurrentUserId() ?? undefined;
  const { profile } = useProfileStore();
  const qc = useQueryClient();

  const isPaired = !!profile?.pairId;

  // Get state and actions from Zustand store (shared across all components)
  const {
    notifications,
    isLoading,
    error,
    setNotifications,
    setLoading,
    setError,
    clear,
  } = useNotificationStore();

  // Set up real-time listener ONLY when paired
  // Use a ref to track if this instance set up the listener
  const isListenerOwner = useRef(false);

  useEffect(() => {
    if (!uid || !isPaired) {
      // Clear notifications when unpaired
      clear();

      // Clean up global listener if this instance owns it
      if (isListenerOwner.current && globalUnsubscribe) {
        globalUnsubscribe();
        globalUnsubscribe = null;
        listenerUid = null;
        isListenerOwner.current = false;
      }
      return;
    }

    // Only set up listener if not already set up for this user
    if (globalUnsubscribe && listenerUid === uid) {
      return;
    }

    // Clean up existing listener if it's for a different user
    if (globalUnsubscribe) {
      globalUnsubscribe();
    }

    setLoading(true);
    listenerUid = uid;
    isListenerOwner.current = true;

    const q = query(
      collection(db, "notifications"),
      where("recipientUid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    globalUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newNotifications: AppNotification[] = snapshot.docs
          .map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              type: String(data.type ?? "other") as any,
              title: String(data.title ?? ""),
              body: String(data.body ?? ""),
              senderUid: String(data.senderUid ?? ""),
              pairId: String(data.pairId ?? ""),
              recipientUid: String(data.recipientUid ?? ""),
              read: Boolean(data.read ?? false),
              createdAt:
                data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
              data: data.data || {},
            };
          })
          // Filter out pair events from notification feed
          .filter(
            (n) => n.type !== "pair_success" && n.type !== "pair_request"
          );

        // Update Zustand store (this triggers re-renders in ALL consumers!)
        setNotifications(newNotifications);

        // Also update React Query cache for other consumers
        qc.setQueryData<AppNotification[]>(key(uid), newNotifications);
      },
      (err) => {
        console.error("❌ [useAppNotifications] Listener error:", err);
        setError(err);
      }
    );

    return () => {
      // Only clean up if this instance owns the listener
      if (isListenerOwner.current && globalUnsubscribe) {
        globalUnsubscribe();
        globalUnsubscribe = null;
        listenerUid = null;
        isListenerOwner.current = false;
      }
    };
  }, [uid, isPaired]);

  // Return in the same shape as before for compatibility
  return {
    data: notifications,
    isLoading,
    error,
    refetch: async () => {
      const data = await AppNotificationService.listForCurrentUser();
      setNotifications(data);
      return { data };
    },
  };
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: (id: string) => {
      return AppNotificationService.markAsRead(id);
    },
  });
}

export function useMarkAllAsRead() {
  return useMutation({
    mutationFn: () => {
      return AppNotificationService.markAllAsRead();
    },
  });
}

export function useDeleteNotification() {
  return useMutation({
    mutationFn: (id: string) => {
      return AppNotificationService.remove(id);
    },
  });
}

export function useClearAllNotifications() {
  return useMutation({
    mutationFn: () => {
      return AppNotificationService.clearAll();
    },
  });
}

export function useUnreadCount() {
  const notifications = useNotificationStore((s) => s.notifications);
  return notifications.filter((n) => !n.read).length;
}
