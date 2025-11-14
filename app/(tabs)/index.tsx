import { useEffect, useState } from "react";
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
  Image,
} from "tamagui";

import { useProfileStore } from "@/store/profile";
import { useAppNotifications, useMarkAsRead } from "@/hooks/useAppNotification";
import { AppNotification } from "@/types";
import { router } from "expo-router";
import { ScreenContainer } from "@/components";

export default function HomeScreen() {
  const profile = useProfileStore((s) => s.profile);
  const partner = useProfileStore((s) => s.partnerProfile);
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useAppNotifications();
  const markAsRead = useMarkAsRead();
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const latestNotifications = notifications.slice(0, 3);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notif: AppNotification) => {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <ScreenContainer title="Home">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <YStack flex={1} padding="$4" paddingTop="$6" gap="$5">
          {/* Header */}
          <YStack gap="$2">
            <Text color="$muted" fontSize={14} fontWeight="600">
              {getGreeting()}
            </Text>
            <Text color="$color" fontSize={32} fontWeight="900">
              {profile?.displayName || "Welcome"}
            </Text>
          </YStack>

          {/* Partner Card */}
          {partner ? (
            <Stack
              backgroundColor="$background"
              borderRadius="$7"
              padding="$4"
              shadowColor="$shadowColor"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.1}
              shadowRadius={8}
            >
              <XStack gap="$3" alignItems="center">
                <Stack
                  width={60}
                  height={60}
                  borderRadius={30}
                  overflow="hidden"
                  backgroundColor="$primary"
                >
                  {partner.avatarUrl ? (
                    <Image
                      source={{ uri: partner.avatarUrl }}
                      width="100%"
                      height="100%"
                      resizeMode="cover"
                    />
                  ) : (
                    <Stack
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color="white" fontSize={24} fontWeight="900">
                        {partner.displayName.charAt(0).toUpperCase()}
                      </Text>
                    </Stack>
                  )}
                </Stack>
                <YStack flex={1} gap="$1">
                  <Text color="$muted" fontSize={12} fontWeight="600">
                    CONNECTED WITH
                  </Text>
                  <Text color="$color" fontSize={18} fontWeight="700">
                    {partner.displayName}
                  </Text>
                  {partner.bio && (
                    <Text color="$muted" fontSize={13} numberOfLines={1}>
                      {partner.bio}
                    </Text>
                  )}
                </YStack>
                <Text fontSize={24}>💕</Text>
              </XStack>
            </Stack>
          ) : (
            <Stack
              backgroundColor="$background"
              borderRadius="$7"
              padding="$4"
              alignItems="center"
              gap="$2"
            >
              <Spinner size="small" />
              <Text color="$muted" fontSize={14}>
                Loading partner info...
              </Text>
            </Stack>
          )}

          {/* Latest Notifications */}
          <YStack gap="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="$color" fontSize={20} fontWeight="700">
                Latest Updates
              </Text>
              {unreadCount > 0 && (
                <Stack
                  backgroundColor="$primary"
                  borderRadius="$7"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  minWidth={24}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="white" fontSize={12} fontWeight="700">
                    {unreadCount}
                  </Text>
                </Stack>
              )}
            </XStack>

            {isLoading ? (
              <YStack gap="$2">
                {[1, 2, 3].map((i) => (
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
            ) : latestNotifications.length > 0 ? (
              <YStack gap="$2">
                {latestNotifications.map((notif) => (
                  <Button
                    key={notif.id}
                    unstyled
                    onPress={() => handleNotificationPress(notif)}
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
                            : "🔔"}
                        </Text>
                        <YStack flex={1} gap="$1">
                          <Text color="$color" fontSize={15} fontWeight="700">
                            {notif.title}
                          </Text>
                          <Text color="$muted" fontSize={13} numberOfLines={2}>
                            {notif.body}
                          </Text>
                          <Text color="$muted" fontSize={11}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </Text>
                        </YStack>
                      </XStack>
                    </Stack>
                  </Button>
                ))}
                <Button
                  backgroundColor="transparent"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$6"
                  height={44}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/(tabs)/notification");
                  }}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text color="$color" fontSize={14} fontWeight="600">
                    View All Notifications
                  </Text>
                </Button>
              </YStack>
            ) : (
              <Stack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$6"
                alignItems="center"
                gap="$3"
              >
                <Text fontSize={48}>🔔</Text>
                <YStack gap="$1" alignItems="center">
                  <Text color="$color" fontSize={16} fontWeight="700">
                    No notifications yet
                  </Text>
                  <Text color="$muted" fontSize={14} textAlign="center">
                    You'll see updates from your partner here
                  </Text>
                </YStack>
              </Stack>
            )}
          </YStack>

          {/* Quick Actions */}
          <YStack gap="$3">
            <Text color="$color" fontSize={20} fontWeight="700">
              Quick Actions
            </Text>
            <XStack gap="$2">
              <Button
                flex={1}
                backgroundColor="$background"
                borderRadius="$6"
                height={100}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/todos");
                }}
                pressStyle={{ opacity: 0.8 }}
              >
                <YStack alignItems="center" gap="$2">
                  <Text fontSize={32}>✅</Text>
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Todos
                  </Text>
                </YStack>
              </Button>
              <Button
                flex={1}
                backgroundColor="$background"
                borderRadius="$6"
                height={100}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/favorites");
                }}
                pressStyle={{ opacity: 0.8 }}
              >
                <YStack alignItems="center" gap="$2">
                  <Text fontSize={32}>⭐</Text>
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Favorites
                  </Text>
                </YStack>
              </Button>
              <Button
                flex={1}
                backgroundColor="$background"
                borderRadius="$6"
                height={100}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/(tabs)/stickers");
                }}
                pressStyle={{ opacity: 0.8 }}
              >
                <YStack alignItems="center" gap="$2">
                  <Text fontSize={32}>🎨</Text>
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Stickers
                  </Text>
                </YStack>
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}
