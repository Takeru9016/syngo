import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { AppNotificationService } from "@/services/notification/notification.service";
import { AppNotification } from "@/types";
import { getCurrentUserId } from "@/services/auth/auth.service";

const key = (uid?: string) => ["app-notifications", uid || "none"] as const;

export function useAppNotifications() {
  const uid = getCurrentUserId() ?? undefined; // Convert null to undefined
  const qc = useQueryClient();

  console.log("🔄 [useAppNotifications] Hook called with uid:", uid);

  // Set up real-time listener
  useEffect(() => {
    if (!uid) {
      console.log("⚠️ [useAppNotifications] No uid, skipping listener");
      return;
    }

    console.log(
      "👂 [useAppNotifications] Setting up real-time listener for uid:",
      uid
    );

    const q = query(
      collection(db, "notifications"),
      where("recipientUid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "🔔 [useAppNotifications] Real-time update received:",
          snapshot.docs.length,
          "notifications"
        );

        const notifications: AppNotification[] = snapshot.docs.map((d) => {
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
            createdAt: Number(data.createdAt ?? 0),
            data: data.data || {},
          };
        });

        // Update React Query cache directly
        qc.setQueryData<AppNotification[]>(key(uid), notifications);
      },
      (error) => {
        console.error("❌ [useAppNotifications] Listener error:", error);
      }
    );

    return () => {
      console.log(
        "🔌 [useAppNotifications] Unsubscribing from real-time listener"
      );
      unsubscribe();
    };
  }, [uid, qc]);

  return useQuery({
    queryKey: key(uid),
    queryFn: () => {
      console.log(
        "🔄 [useAppNotifications] Query function executing for uid:",
        uid
      );
      return AppNotificationService.listForCurrentUser();
    },
    enabled: !!uid,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: (id: string) => {
      console.log("✏️ [useMarkAsRead] Mutation called for id:", id);
      return AppNotificationService.markAsRead(id);
    },
    onError: (error) => {
      console.error("❌ [useMarkAsRead] Error:", error);
    },
    onSuccess: (_, id) => {
      console.log("✅ [useMarkAsRead] Success for id:", id);
    },
  });
}

export function useMarkAllAsRead() {
  return useMutation({
    mutationFn: () => {
      console.log("✏️ [useMarkAllAsRead] Mutation called");
      return AppNotificationService.markAllAsRead();
    },
    onError: (error) => {
      console.error("❌ [useMarkAllAsRead] Error:", error);
    },
    onSuccess: () => {
      console.log("✅ [useMarkAllAsRead] Success");
    },
  });
}

export function useDeleteNotification() {
  return useMutation({
    mutationFn: (id: string) => {
      console.log("🗑️ [useDeleteNotification] Mutation called for id:", id);
      return AppNotificationService.remove(id);
    },
    onError: (error) => {
      console.error("❌ [useDeleteNotification] Error:", error);
    },
    onSuccess: (_, id) => {
      console.log("✅ [useDeleteNotification] Success for id:", id);
    },
  });
}

export function useClearAllNotifications() {
  return useMutation({
    mutationFn: () => {
      console.log("🗑️ [useClearAllNotifications] Mutation called");
      return AppNotificationService.clearAll();
    },
    onError: (error) => {
      console.error("❌ [useClearAllNotifications] Error:", error);
    },
    onSuccess: () => {
      console.log("✅ [useClearAllNotifications] Success");
    },
  });
}

export function useUnreadCount() {
  const { data: notifications = [] } = useAppNotifications();
  return notifications.filter((n) => !n.read).length;
}
