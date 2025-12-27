import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { AppState, AppStateStatus } from "react-native";

import { useInAppNotification } from "@/components";
import { AppNotificationType } from "@/types";

/**
 * Hook to handle incoming notifications when app is in foreground
 * Shows custom in-app banner instead of system notification
 */
export function useForegroundNotification() {
    const { showBanner } = useInAppNotification();
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        // Track app state
        const subscription = AppState.addEventListener(
            "change",
            (nextAppState: AppStateStatus) => {
                appState.current = nextAppState;
            }
        );

        // Listen for notifications received while app is in foreground
        const notificationListener = Notifications.addNotificationReceivedListener(
            (notification) => {
                // Only show banner if app is in foreground
                if (appState.current === "active") {
                    const { title, body, data } = notification.request.content;

                    // Determine notification type from data
                    const type = (data?.type as AppNotificationType) || "other";

                    // Get image URL if available (e.g., for stickers, favorites)
                    const imageUrl = data?.imageUrl as string | undefined;

                    showBanner({
                        title: title || "Notification",
                        body: body || "",
                        type,
                        imageUrl,
                        onPress: () => {
                            // Handle notification press - can navigate based on type
                            if (data?.onPressRoute) {
                                // Router navigation can be handled here
                            }
                        },
                    });
                }
            }
        );

        return () => {
            subscription.remove();
            notificationListener.remove();
        };
    }, [showBanner]);
}

/**
 * Standalone function to trigger a test notification banner
 * Useful for development/testing
 */
export function useTestNotificationBanner() {
    const { showBanner } = useInAppNotification();

    return {
        showTestNudge: () => {
            showBanner({
                title: "Thinking of you",
                body: "Your partner sent you a nudge!",
                type: "nudge",
            });
        },
        showTestSticker: () => {
            showBanner({
                title: "New Sticker",
                body: "You received a cute sticker!",
                type: "sticker_sent",
            });
        },
        showTestTodo: () => {
            showBanner({
                title: "Todo Reminder",
                body: "Don't forget to complete your task!",
                type: "todo_reminder",
            });
        },
        showTestFavorite: () => {
            showBanner({
                title: "New Favorite",
                body: "A new favorite was added!",
                type: "favorite_added",
            });
        },
        showTestSystem: () => {
            showBanner({
                title: "System Update",
                body: "Connection successful!",
                type: "pair_success",
            });
        },
    };
}
