import { useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Stack,
  Image,
  Spinner,
} from "tamagui";
import { router } from "expo-router";

import { AppNotification, Todo, Favorite, Sticker } from "@/types";
import { useProfileStore } from "@/store/profile";
import { useTodos } from "@/hooks/useTodo";
import { useFavorites } from "@/hooks/useFavorites";
import { useStickers } from "@/hooks/useStickers";
import {
  useAppNotifications,
  useUnreadCount,
} from "@/hooks/useAppNotification";

export default function HomeScreen() {
  const profile = useProfileStore((s) => s.profile);
  const partner = useProfileStore((s) => s.partnerProfile);

  const {
    data: todos = [],
    isLoading: todosLoading,
    refetch: refetchTodos,
  } = useTodos();
  const {
    data: favorites = [],
    isLoading: favsLoading,
    refetch: refetchFavs,
  } = useFavorites();
  const {
    data: stickers = [],
    isLoading: stickersLoading,
    refetch: refetchStickers,
  } = useStickers();
  const {
    data: notifications = [],
    isLoading: notifsLoading,
    refetch: refetchNotifs,
  } = useAppNotifications();
  const unreadCount = useUnreadCount();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchTodos(),
      refetchFavs(),
      refetchStickers(),
      refetchNotifs(),
    ]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Derived data
  const upcomingTodos = todos
    .filter((t) => !t.isCompleted && t.dueDate)
    .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
    .slice(0, 3);

  const recentFavorites = favorites
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);

  const latestNotification = notifications[0] || null;

  const isLoading =
    todosLoading || favsLoading || stickersLoading || notifsLoading;

  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "sticker_sent":
        return "🎨";
      case "favorite_added":
        return "⭐";
      case "todo_created":
      case "todo_completed":
        return "✓";
      case "pair_request":
      case "pair_accepted":
        return "💕";
      default:
        return "🔔";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "movie":
        return "🎬";
      case "food":
        return "🍕";
      case "place":
        return "📍";
      case "quote":
        return "💭";
      case "link":
        return "🔗";
      default:
        return "⭐";
    }
  };

  return (
    <YStack flex={1} backgroundColor="$bg">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack flex={1} padding="$4" paddingTop="$6" gap="$5">
          {/* Header with Greeting */}
          <YStack gap="$2">
            <Text color="$muted" fontSize={16} fontWeight="600">
              {getGreeting()}
            </Text>
            <Text color="$color" fontSize={32} fontWeight="900">
              {profile?.displayName || "Welcome"}
            </Text>
          </YStack>

          {/* Partner Card */}
          {partner && (
            <Stack
              backgroundColor="$primary"
              borderRadius="$7"
              padding="$4"
              pressStyle={{ opacity: 0.9 }}
              onPress={() => router.push("/(tabs)/settings")}
            >
              <XStack gap="$3" alignItems="center">
                <Stack
                  width={60}
                  height={60}
                  borderRadius={30}
                  overflow="hidden"
                  backgroundColor="white"
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
                      backgroundColor="rgba(255,255,255,0.3)"
                    >
                      <Text color="white" fontSize={24} fontWeight="900">
                        {partner.displayName.charAt(0).toUpperCase()}
                      </Text>
                    </Stack>
                  )}
                </Stack>
                <YStack flex={1} gap="$1">
                  <Text color="white" fontSize={14} opacity={0.9}>
                    Connected with
                  </Text>
                  <Text color="white" fontSize={20} fontWeight="900">
                    {partner.displayName}
                  </Text>
                </YStack>
                <Text fontSize={32}>💕</Text>
              </XStack>
            </Stack>
          )}

          {/* Loading State */}
          {isLoading && (
            <YStack alignItems="center" paddingVertical="$8">
              <Spinner size="large" color="$primary" />
            </YStack>
          )}

          {!isLoading && (
            <>
              {/* Quick Stats */}
              <YStack gap="$3">
                <Text color="$color" fontSize={18} fontWeight="700">
                  Overview
                </Text>
                <XStack gap="$2">
                  <Stack
                    flex={1}
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$3"
                    alignItems="center"
                    gap="$2"
                  >
                    <Text fontSize={28}>✓</Text>
                    <Text color="$color" fontSize={24} fontWeight="900">
                      {todos.filter((t) => !t.isCompleted).length}
                    </Text>
                    <Text color="$muted" fontSize={13}>
                      Active Todos
                    </Text>
                  </Stack>

                  <Stack
                    flex={1}
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$3"
                    alignItems="center"
                    gap="$2"
                  >
                    <Text fontSize={28}>⭐</Text>
                    <Text color="$color" fontSize={24} fontWeight="900">
                      {favorites.length}
                    </Text>
                    <Text color="$muted" fontSize={13}>
                      Favorites
                    </Text>
                  </Stack>

                  <Stack
                    flex={1}
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$3"
                    alignItems="center"
                    gap="$2"
                  >
                    <Text fontSize={28}>🎨</Text>
                    <Text color="$color" fontSize={24} fontWeight="900">
                      {stickers.length}
                    </Text>
                    <Text color="$muted" fontSize={13}>
                      Stickers
                    </Text>
                  </Stack>
                </XStack>
              </YStack>

              {/* Quick Actions */}
              <YStack gap="$3">
                <Text color="$color" fontSize={18} fontWeight="700">
                  Quick Actions
                </Text>
                <XStack gap="$2">
                  <Button
                    flex={1}
                    backgroundColor="$background"
                    borderRadius="$6"
                    height={100}
                    onPress={() => router.push("/(tabs)/todos")}
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  >
                    <YStack alignItems="center" gap="$2">
                      <Text fontSize={36}>✓</Text>
                      <Text color="$color" fontSize={14} fontWeight="700">
                        Todos
                      </Text>
                      {upcomingTodos.length > 0 && (
                        <Stack
                          backgroundColor="$primary"
                          borderRadius={12}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          minWidth={24}
                          alignItems="center"
                        >
                          <Text color="white" fontSize={12} fontWeight="700">
                            {upcomingTodos.length}
                          </Text>
                        </Stack>
                      )}
                    </YStack>
                  </Button>

                  <Button
                    flex={1}
                    backgroundColor="$background"
                    borderRadius="$6"
                    height={100}
                    onPress={() => router.push("/(tabs)/stickers")}
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  >
                    <YStack alignItems="center" gap="$2">
                      <Text fontSize={36}>🎨</Text>
                      <Text color="$color" fontSize={14} fontWeight="700">
                        Stickers
                      </Text>
                    </YStack>
                  </Button>
                </XStack>

                <XStack gap="$2">
                  <Button
                    flex={1}
                    backgroundColor="$background"
                    borderRadius="$6"
                    height={100}
                    onPress={() => router.push("/(tabs)/favorites")}
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  >
                    <YStack alignItems="center" gap="$2">
                      <Text fontSize={36}>⭐</Text>
                      <Text color="$color" fontSize={14} fontWeight="700">
                        Favorites
                      </Text>
                    </YStack>
                  </Button>

                  <Button
                    flex={1}
                    backgroundColor="$background"
                    borderRadius="$6"
                    height={100}
                    onPress={() => router.push("/(tabs)/notification")}
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    position="relative"
                  >
                    <YStack alignItems="center" gap="$2">
                      <Text fontSize={36}>🔔</Text>
                      <Text color="$color" fontSize={14} fontWeight="700">
                        Notifications
                      </Text>
                      {unreadCount > 0 && (
                        <Stack
                          position="absolute"
                          top={8}
                          right={8}
                          backgroundColor="$red10"
                          borderRadius={12}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          minWidth={24}
                          alignItems="center"
                        >
                          <Text color="white" fontSize={12} fontWeight="700">
                            {unreadCount}
                          </Text>
                        </Stack>
                      )}
                    </YStack>
                  </Button>
                </XStack>
              </YStack>

              {/* Upcoming Todos */}
              {upcomingTodos.length > 0 && (
                <YStack gap="$3">
                  <XStack alignItems="center" justifyContent="space-between">
                    <Text color="$color" fontSize={18} fontWeight="700">
                      Upcoming
                    </Text>
                    <Button
                      unstyled
                      onPress={() => router.push("/(tabs)/todos")}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Text color="$primary" fontSize={14} fontWeight="600">
                        View All
                      </Text>
                    </Button>
                  </XStack>
                  <YStack gap="$2">
                    {upcomingTodos.map((todo) => (
                      <Stack
                        key={todo.id}
                        backgroundColor="$background"
                        borderRadius="$6"
                        padding="$3"
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => router.push("/(tabs)/todos")}
                      >
                        <XStack gap="$3" alignItems="center">
                          <Stack
                            width={40}
                            height={40}
                            borderRadius={20}
                            backgroundColor="$bg"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize={20}>
                              {todo.priority === "high"
                                ? "🔴"
                                : todo.priority === "medium"
                                ? "🟡"
                                : "🟢"}
                            </Text>
                          </Stack>
                          <YStack flex={1} gap="$1">
                            <Text color="$color" fontSize={15} fontWeight="600">
                              {todo.title}
                            </Text>
                            {todo.dueDate && (
                              <Text color="$muted" fontSize={13}>
                                Due {formatDate(todo.dueDate)}
                              </Text>
                            )}
                          </YStack>
                        </XStack>
                      </Stack>
                    ))}
                  </YStack>
                </YStack>
              )}

              {/* Recent Favorites */}
              {recentFavorites.length > 0 && (
                <YStack gap="$3">
                  <XStack alignItems="center" justifyContent="space-between">
                    <Text color="$color" fontSize={18} fontWeight="700">
                      Recent Favorites
                    </Text>
                    <Button
                      unstyled
                      onPress={() => router.push("/(tabs)/favorites")}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Text color="$primary" fontSize={14} fontWeight="600">
                        View All
                      </Text>
                    </Button>
                  </XStack>
                  <XStack gap="$2" flexWrap="wrap">
                    {recentFavorites.map((fav) => (
                      <Stack
                        key={fav.id}
                        width="48%"
                        aspectRatio={1}
                        borderRadius="$6"
                        overflow="hidden"
                        backgroundColor="$background"
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => router.push("/(tabs)/favorites")}
                      >
                        {fav.imageUrl ? (
                          <Image
                            source={{ uri: fav.imageUrl }}
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
                            backgroundColor="$background"
                          >
                            <Text fontSize={48}>
                              {getCategoryIcon(fav.category)}
                            </Text>
                          </Stack>
                        )}
                        <Stack
                          position="absolute"
                          bottom={0}
                          left={0}
                          right={0}
                          backgroundColor="rgba(0,0,0,0.6)"
                          padding="$2"
                        >
                          <Text
                            color="white"
                            fontSize={13}
                            fontWeight="600"
                            numberOfLines={1}
                          >
                            {fav.title}
                          </Text>
                        </Stack>
                      </Stack>
                    ))}
                  </XStack>
                </YStack>
              )}

              {/* Latest Notification */}
              {latestNotification && (
                <YStack gap="$3">
                  <XStack alignItems="center" justifyContent="space-between">
                    <Text color="$color" fontSize={18} fontWeight="700">
                      Latest Update
                    </Text>
                    <Button
                      unstyled
                      onPress={() => router.push("/(tabs)/notification")}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Text color="$primary" fontSize={14} fontWeight="600">
                        View All
                      </Text>
                    </Button>
                  </XStack>
                  <Stack
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    pressStyle={{ opacity: 0.8 }}
                    onPress={() => router.push("/(tabs)/notification")}
                  >
                    <YStack gap="$2">
                      <XStack gap="$3" alignItems="center">
                        <Stack
                          width={40}
                          height={40}
                          borderRadius={20}
                          backgroundColor="$bg"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize={20}>
                            {getNotificationIcon(latestNotification.type)}
                          </Text>
                        </Stack>
                        <YStack flex={1} gap="$1">
                          <Text color="$color" fontSize={16} fontWeight="700">
                            {latestNotification.title}
                          </Text>
                          <Text color="$muted" fontSize={14}>
                            {latestNotification.body}
                          </Text>
                          <Text color="$muted" fontSize={12}>
                            {formatTimeAgo(latestNotification.createdAt)}
                          </Text>
                        </YStack>
                        {!latestNotification.read && (
                          <Stack
                            width={8}
                            height={8}
                            borderRadius={4}
                            backgroundColor="$primary"
                          />
                        )}
                      </XStack>
                    </YStack>
                  </Stack>
                </YStack>
              )}

              {/* Empty State */}
              {!latestNotification &&
                upcomingTodos.length === 0 &&
                recentFavorites.length === 0 &&
                todos.length === 0 &&
                favorites.length === 0 &&
                stickers.length === 0 && (
                  <YStack
                    flex={1}
                    alignItems="center"
                    justifyContent="center"
                    gap="$3"
                    paddingVertical="$8"
                  >
                    <Text fontSize={80}>💕</Text>
                    <Text
                      color="$color"
                      fontSize={20}
                      fontWeight="700"
                      textAlign="center"
                    >
                      Welcome to Notify!
                    </Text>
                    <Text
                      color="$muted"
                      fontSize={15}
                      textAlign="center"
                      paddingHorizontal="$6"
                    >
                      Start by adding todos, favorites, or sending stickers to
                      your partner
                    </Text>
                  </YStack>
                )}
            </>
          )}

          {/* Bottom Padding */}
          <Stack height={20} />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
