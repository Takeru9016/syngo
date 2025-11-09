import { useState } from "react";
import { RefreshControl, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Stack,
  Spinner,
} from "tamagui";

import {
  useAppNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "@/hooks/useAppNotification";
import { AppNotification } from "@/types";
import { router } from "expo-router";

export default function NotificationsScreen() {
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useAppNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const clearAll = useClearAllNotifications();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

  const handlePress = async (notif: AppNotification) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!notif.read) {
      markAsRead.mutate(notif.id);
    }
    // Navigate based on notification type
    if (notif.type === "todo_reminder") {
      router.push("/(tabs)/todos");
    } else if (notif.type === "sticker_sent") {
      router.push("/(tabs)/stickers");
    } else if (notif.type === "favorite_added") {
      router.push("/(tabs)/favorites");
    }
  };

  const handleDelete = async (id: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteNotification.mutate(id);
  };

  const handleMarkAllAsRead = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markAllAsRead.mutate();
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
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
            clearAll.mutate();
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <YStack flex={1} backgroundColor="$bg">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$5"
                    height={36}
                    paddingHorizontal="$3"
                    onPress={handleMarkAllAsRead}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Text color="$color" fontSize={13} fontWeight="600">
                      Mark All Read
                    </Text>
                  </Button>
                )}
                <Button
                  backgroundColor="transparent"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$5"
                  height={36}
                  paddingHorizontal="$3"
                  onPress={handleClearAll}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text color="#f44336" fontSize={13} fontWeight="600">
                    Clear All
                  </Text>
                </Button>
              </XStack>
            )}
          </XStack>

          {/* Loading State */}
          {isLoading ? (
            <YStack gap="$2">
              {[1, 2, 3, 4].map((i) => (
                <Stack
                  key={i}
                  backgroundColor="$background"
                  borderRadius="$6"
                  padding="$4"
                  height={80}
                >
                  <Spinner size="small" />
                </Stack>
              ))}
            </YStack>
          ) : notifications.length === 0 ? (
            /* Empty State */
            <Stack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingVertical="$10"
              gap="$4"
            >
              <Text fontSize={64}>🔔</Text>
              <YStack gap="$2" alignItems="center">
                <Text color="$color" fontSize={20} fontWeight="700">
                  No notifications
                </Text>
                <Text
                  color="$muted"
                  fontSize={15}
                  textAlign="center"
                  maxWidth={280}
                >
                  You'll see updates from your partner here
                </Text>
              </YStack>
            </Stack>
          ) : (
            /* Notifications List */
            <YStack gap="$2">
              {notifications.map((notif) => (
                <Button
                  key={notif.id}
                  unstyled
                  onPress={() => handlePress(notif)}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert(
                      "Delete Notification",
                      "Remove this notification?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => handleDelete(notif.id),
                        },
                      ]
                    );
                  }}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Stack
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    opacity={notif.read ? 0.6 : 1}
                    borderLeftWidth={4}
                    borderLeftColor={notif.read ? "$borderColor" : "$primary"}
                  >
                    <XStack gap="$3" alignItems="flex-start">
                      <Text fontSize={24}>
                        {notif.type === "todo_reminder"
                          ? "⏰"
                          : notif.type === "sticker_sent"
                          ? "🎨"
                          : notif.type === "favorite_added"
                          ? "⭐"
                          : notif.type === "pair_success"
                          ? "💕"
                          : "🔔"}
                      </Text>
                      <YStack flex={1} gap="$1">
                        <Text color="$color" fontSize={15} fontWeight="700">
                          {notif.title}
                        </Text>
                        <Text color="$muted" fontSize={13}>
                          {notif.body}
                        </Text>
                        <Text color="$muted" fontSize={11}>
                          {new Date(notif.createdAt).toLocaleString()}
                        </Text>
                      </YStack>
                      {!notif.read && (
                        <Stack
                          width={8}
                          height={8}
                          borderRadius={4}
                          backgroundColor="$primary"
                        />
                      )}
                    </XStack>
                  </Stack>
                </Button>
              ))}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
