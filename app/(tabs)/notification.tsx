import { useState } from "react";
import { RefreshControl, Alert } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Stack,
  Spinner,
} from "tamagui";
import { format } from "date-fns";

import {
  useAppNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "@/hooks/useAppNotification";
import { AppNotification } from "@/types";

function getNotificationIcon(type: string): string {
  switch (type) {
    case "todo_created":
      return "✅";
    case "todo_completed":
      return "🎉";
    case "favorite_added":
      return "⭐";
    case "sticker_sent":
      return "🎨";
    case "pair_connected":
      return "💑";
    default:
      return "🔔";
  }
}

function NotificationCard({
  notification,
  onPress,
  onDelete,
}: {
  notification: AppNotification;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Stack
      backgroundColor={notification.read ? "$background" : "$primary"}
      opacity={notification.read ? 0.7 : 1}
      borderRadius="$6"
      padding="$4"
      gap="$2"
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
    >
      <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
        <XStack flex={1} gap="$3" alignItems="flex-start">
          <Text fontSize={32}>{getNotificationIcon(notification.type)}</Text>
          <YStack flex={1} gap="$1">
            <Text
              color={notification.read ? "$color" : "white"}
              fontSize={16}
              fontWeight="700"
            >
              {notification.title}
            </Text>
            <Text
              color={notification.read ? "$muted" : "rgba(255,255,255,0.9)"}
              fontSize={14}
            >
              {notification.body}
            </Text>
            <Text
              color={notification.read ? "$muted" : "rgba(255,255,255,0.7)"}
              fontSize={12}
              marginTop="$1"
            >
              {format(notification.createdAt, "MMM d, h:mm a")}
            </Text>
          </YStack>
        </XStack>
        <Button
          unstyled
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Text color={notification.read ? "$muted" : "white"} fontSize={20}>
            ✕
          </Text>
        </Button>
      </XStack>
    </Stack>
  );
}

export default function NotificationsScreen() {
  const {
    data: notifications = [],
    isLoading,
    refetch,
    isRefetching,
  } = useAppNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const clearAll = useClearAllNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n: any) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const onRefresh = async () => {
    await refetch();
  };

  const handleNotificationPress = async (notification: AppNotification) => {
    if (!notification.read) {
      await markAsRead.mutateAsync(notification.id);
    }
    // TODO: Navigate to relevant screen based on notification.type and notification.data
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      Alert.alert("Error", "Failed to mark all as read");
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAll.mutateAsync();
            } catch (error) {
              console.error("Failed to clear all:", error);
              Alert.alert("Error", "Failed to clear notifications");
            }
          },
        },
      ]
    );
  };

  return (
    <YStack flex={1} backgroundColor="$bg">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        <YStack flex={1} padding="$4" paddingTop="$6" gap="$4">
          {/* Header */}
          <XStack alignItems="center" justifyContent="space-between">
            <YStack gap="$1">
              <Text color="$color" fontSize={28} fontWeight="900">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Text color="$muted" fontSize={14}>
                  {unreadCount} unread
                </Text>
              )}
            </YStack>
            {notifications.length > 0 && (
              <XStack gap="$2">
                {unreadCount > 0 && (
                  <Button
                    backgroundColor="$background"
                    borderRadius="$6"
                    height={36}
                    paddingHorizontal="$3"
                    onPress={handleMarkAllAsRead}
                    disabled={markAllAsRead.isPending}
                    pressStyle={{ opacity: 0.8 }}
                  >
                    {markAllAsRead.isPending ? (
                      <Spinner size="small" />
                    ) : (
                      <Text color="$color" fontWeight="600" fontSize={13}>
                        Mark All Read
                      </Text>
                    )}
                  </Button>
                )}
                <Button
                  backgroundColor="$background"
                  borderRadius="$6"
                  height={36}
                  paddingHorizontal="$3"
                  onPress={handleClearAll}
                  disabled={clearAll.isPending}
                  pressStyle={{ opacity: 0.8 }}
                >
                  {clearAll.isPending ? (
                    <Spinner size="small" />
                  ) : (
                    <Text color="$color" fontWeight="600" fontSize={13}>
                      Clear All
                    </Text>
                  )}
                </Button>
              </XStack>
            )}
          </XStack>

          {/* Filter */}
          {notifications.length > 0 && (
            <XStack gap="$2">
              <Button
                flex={1}
                backgroundColor={filter === "all" ? "$primary" : "$background"}
                borderRadius="$5"
                height={40}
                onPress={() => setFilter("all")}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text
                  color={filter === "all" ? "white" : "$color"}
                  fontWeight="600"
                  fontSize={14}
                >
                  All ({notifications.length})
                </Text>
              </Button>
              <Button
                flex={1}
                backgroundColor={
                  filter === "unread" ? "$primary" : "$background"
                }
                borderRadius="$5"
                height={40}
                onPress={() => setFilter("unread")}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text
                  color={filter === "unread" ? "white" : "$color"}
                  fontWeight="600"
                  fontSize={14}
                >
                  Unread ({unreadCount})
                </Text>
              </Button>
            </XStack>
          )}

          {/* List */}
          {filteredNotifications.length === 0 ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$3"
            >
              <Text fontSize={60}>🔔</Text>
              <Text color="$muted" fontSize={16} textAlign="center">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet.\nActivity from your partner will appear here."}
              </Text>
            </YStack>
          ) : (
            <YStack gap="$3">
              {filteredNotifications.map((notification: any) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleNotificationPress(notification)}
                  onDelete={() => handleDelete(notification.id)}
                />
              ))}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
