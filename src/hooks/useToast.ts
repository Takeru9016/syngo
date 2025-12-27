import { useCallback } from "react";
import { useInAppNotification } from "@/components";
import { AppNotificationType } from "@/types";

/**
 * Simple toast notification hook
 * Uses the in-app notification banner with simplified API
 */
export function useToast() {
    const { showBanner } = useInAppNotification();

    const toast = useCallback(
        (options: {
            title: string;
            body?: string;
            type?: AppNotificationType;
            onPress?: () => void;
        }) => {
            showBanner({
                title: options.title,
                body: options.body || "",
                type: options.type || "other",
                onPress: options.onPress,
            });
        },
        [showBanner]
    );

    // Convenience methods for common toast types
    const success = useCallback(
        (title: string, body?: string) => {
            toast({ title, body, type: "other" });
        },
        [toast]
    );

    const error = useCallback(
        (title: string, body?: string) => {
            toast({ title, body, type: "other" });
        },
        [toast]
    );

    const info = useCallback(
        (title: string, body?: string) => {
            toast({ title, body, type: "other" });
        },
        [toast]
    );

    const nudge = useCallback(
        (senderName?: string) => {
            toast({
                title: "Thinking of you",
                body: senderName
                    ? `${senderName} sent you a nudge!`
                    : "Someone is thinking of you!",
                type: "nudge",
            });
        },
        [toast]
    );

    const sticker = useCallback(
        (senderName?: string) => {
            toast({
                title: "New Sticker",
                body: senderName
                    ? `${senderName} sent you a sticker!`
                    : "You received a new sticker!",
                type: "sticker_sent",
            });
        },
        [toast]
    );

    const todo = useCallback(
        (title: string) => {
            toast({
                title: "Todo Reminder",
                body: title,
                type: "todo_reminder",
            });
        },
        [toast]
    );

    const favorite = useCallback(
        (title: string) => {
            toast({
                title: "New Favorite",
                body: `Added "${title}" to favorites`,
                type: "favorite_added",
            });
        },
        [toast]
    );

    return {
        toast,
        success,
        error,
        info,
        nudge,
        sticker,
        todo,
        favorite,
    };
}
