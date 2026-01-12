/**
 * useWidgetUpdates Hook
 *
 * Automatically updates home screen widgets when relevant data changes.
 * Call this hook in the main app layout to keep widgets in sync.
 */

import { useEffect, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

import { useProfileStore } from "@/store/profile";
import { useNotificationStore } from "@/store/notification";
import { WidgetService } from "@/services/widget/widget.service";
import { useTodayMood, usePartnerMood } from "@/hooks/useMood";

/**
 * Hook to keep widgets updated with latest app data
 */
export function useWidgetUpdates() {
  const profile = useProfileStore((s) => s.profile);
  const partnerProfile = useProfileStore((s) => s.partnerProfile);
  const notifications = useNotificationStore((s) => s.notifications);

  const { data: myMood } = useTodayMood();
  const { data: partnerMood } = usePartnerMood();

  const lastUpdateRef = useRef<number>(0);
  const isUpdatingRef = useRef(false);

  // Debounced update function
  const updateWidgets = async () => {
    // Debounce: Don't update more than once every 5 seconds
    const now = Date.now();
    if (now - lastUpdateRef.current < 5000) return;
    if (isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    lastUpdateRef.current = now;

    try {
      await WidgetService.updateWidgets({
        notifications,
        myMood,
        partnerMood,
        pendingTodos: 0, // TODO: Get from todos hook if needed
      });
    } catch (error) {
      console.error("❌ [useWidgetUpdates] Failed to update widgets:", error);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  // Update widgets when app comes to foreground
  useEffect(() => {
    if (Platform.OS === "web") return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        updateWidgets();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Initial update when hook mounts
    updateWidgets();

    return () => {
      subscription.remove();
    };
  }, []);

  // Update widgets when profile changes (e.g., mood update)
  useEffect(() => {
    if (!profile?.pairId) return;
    updateWidgets();
  }, [profile?.pairId, partnerProfile?.avatarUrl]);

  // Update widgets when notifications change
  useEffect(() => {
    if (!notifications.length) return;
    updateWidgets();
  }, [notifications.length]);

  // Update widgets when mood changes
  useEffect(() => {
    if (myMood || partnerMood) {
      updateWidgets();
    }
  }, [myMood?.level, partnerMood?.level]);
}
