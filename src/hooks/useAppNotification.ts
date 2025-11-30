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
import { useProfileStore } from "@/store/profile"; // ADD THIS IMPORT

const key = (uid?: string) => ["app-notifications", uid || "none"] as const;

export function useAppNotifications() {
  const uid = getCurrentUserId() ?? undefined;
  const { profile } = useProfileStore(); // ADD THIS LINE
  const qc = useQueryClient();

  const isPaired = !!profile?.pairId; // ADD THIS LINE

  // Set up real-time listener ONLY when paired
  useEffect(() => {
    if (!uid || !isPaired) {

      // Clear notifications when unpaired
      qc.setQueryData<AppNotification[]>(key(uid), []);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("recipientUid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
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
      unsubscribe();
    };
  }, [uid, isPaired, qc]); // ADD isPaired TO DEPS

  return useQuery({
    queryKey: key(uid),
    queryFn: () => {
      return AppNotificationService.listForCurrentUser();
    },
    enabled: !!uid && isPaired, // ADD isPaired CHECK
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useMarkAsRead() {
  return useMutation({
    mutationFn: (id: string) => {
      return AppNotificationService.markAsRead(id);
    },
    onError: (error) => {
      console.error("❌ [useMarkAsRead] Error:", error);
    },
    onSuccess: (_, id) => {
    },
  });
}

export function useMarkAllAsRead() {
  return useMutation({
    mutationFn: () => {
      return AppNotificationService.markAllAsRead();
    },
    onError: (error) => {
      console.error("❌ [useMarkAllAsRead] Error:", error);
    },
    onSuccess: () => {
    },
  });
}

export function useDeleteNotification() {
  return useMutation({
    mutationFn: (id: string) => {
      return AppNotificationService.remove(id);
    },
    onError: (error) => {
      console.error("❌ [useDeleteNotification] Error:", error);
    },
    onSuccess: (_, id) => {
    },
  });
}

export function useClearAllNotifications() {
  return useMutation({
    mutationFn: () => {
      return AppNotificationService.clearAll();
    },
    onError: (error) => {
      console.error("❌ [useClearAllNotifications] Error:", error);
    },
    onSuccess: () => {
    },
  });
}

export function useUnreadCount() {
  const { data: notifications = [] } = useAppNotifications();
  return notifications.filter((n) => !n.read).length;
}
