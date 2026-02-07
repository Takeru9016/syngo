/**
 * useWidgetUpdates Hook
 *
 * Automatically updates home screen widgets when:
 * - App comes to foreground
 * - Data changes (mood, todos, notifications)
 * - Push notification is received
 */

import { useEffect, useCallback } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { updateWidgets } from "@/services/widget/widget.service";
import { useTodayMood, usePartnerMood } from "@/hooks/useMood";
import { useTodos } from "@/hooks/useTodo";
import { useAppNotifications } from "@/hooks/useAppNotification";
import { usePairingStore } from "@/store/pairing";
import type { Todo, AppNotification } from "@/types";

/**
 * Hook to keep widgets in sync with app data
 */
export function useWidgetUpdates() {
  const { data: todayMood } = useTodayMood();
  const { data: partnerMood } = usePartnerMood();
  const { data: todos } = useTodos();
  const { data: notifications } = useAppNotifications();

  // Subscribe to pairCreatedAt so widgets update when pair data is loaded
  const pairCreatedAt = usePairingStore((s) => s.pairCreatedAt);

  // Calculate stats
  const pendingTodos =
    (todos as Todo[] | undefined)?.filter((t) => !t.isCompleted).length || 0;
  const unreadNotifications =
    (notifications as AppNotification[] | undefined)?.filter((n) => !n.read)
      .length || 0;
  const recentNotifications = (
    (notifications as AppNotification[] | undefined) || []
  ).slice(0, 5);

  // Update widgets with current data
  const syncWidgets = useCallback(async () => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return; // Skip on web
    }

    try {
      await updateWidgets({
        userMood: todayMood,
        partnerMood,
        pendingTodos,
        unreadNotifications,
        recentNotifications,
      });
    } catch (error) {
      console.warn("[useWidgetUpdates] Failed to sync widgets:", error);
    }
  }, [
    todayMood,
    partnerMood,
    pendingTodos,
    unreadNotifications,
    recentNotifications,
    pairCreatedAt, // Re-sync when pair data is loaded
  ]);

  // Update on app foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        syncWidgets();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [syncWidgets]);

  // Update when data changes
  useEffect(() => {
    syncWidgets();
  }, [syncWidgets]);

  return { syncWidgets };
}
