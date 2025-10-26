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
} from "tamagui";
import { router } from "expo-router";

import { UserProfile, Notification, Todo, Favorite, Sticker } from "@/types";

import { getProfile, getPartnerProfile } from "@/services/profile.mock";
import { getFavorites } from "@/services/favorites.mock";
import { getStickers } from "@/services/stickers.mock";
import { getNotifications } from "@/services/notification.mock";
import { getTodos } from "@/services/todo.mock";

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [latestNotification, setLatestNotification] =
    useState<Notification | null>(null);
  const [upcomingTodos, setUpcomingTodos] = useState<Todo[]>([]);
  const [recentFavorites, setRecentFavorites] = useState<Favorite[]>([]);
  const [stickerCount, setStickerCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [prof, part, notifs, todos, favs, stickers] = await Promise.all([
      getProfile(),
      getPartnerProfile(),
      getNotifications(),
      getTodos(),
      getFavorites(),
      getStickers(),
    ]);

    setProfile(prof);
    setPartner(part);
    setLatestNotification(notifs[0] || null);
    setUpcomingTodos(
      todos
        .filter((t) => !t.isCompleted && t.dueDate)
        .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
        .slice(0, 3)
    );
    setRecentFavorites(favs.slice(0, 4));
    setStickerCount(stickers.length);
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
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
                pressStyle={{ opacity: 0.8 }}
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
                pressStyle={{ opacity: 0.8 }}
              >
                <YStack alignItems="center" gap="$2">
                  <Text fontSize={36}>🎨</Text>
                  <Text color="$color" fontSize={14} fontWeight="700">
                    Stickers
                  </Text>
                  {stickerCount > 0 && (
                    <Text color="$muted" fontSize={12}>
                      {stickerCount} total
                    </Text>
                  )}
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
                pressStyle={{ opacity: 0.8 }}
              >
                <YStack alignItems="center" gap="$2">
                  <Text fontSize={36}>⭐</Text>
                  <Text color="$color" fontSize={14} fontWeight="700">
                    Favorites
                  </Text>
                  {recentFavorites.length > 0 && (
                    <Text color="$muted" fontSize={12}>
                      {recentFavorites.length} recent
                    </Text>
                  )}
                </YStack>
              </Button>

              <Button
                flex={1}
                backgroundColor="$background"
                borderRadius="$6"
                height={100}
                onPress={() => router.push("/(tabs)/settings")}
                pressStyle={{ opacity: 0.8 }}
              >
                <YStack alignItems="center" gap="$2">
                  <Text fontSize={36}>⚙️</Text>
                  <Text color="$color" fontSize={14} fontWeight="700">
                    Settings
                  </Text>
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
                          {fav.category === "movie"
                            ? "🎬"
                            : fav.category === "food"
                            ? "🍕"
                            : fav.category === "place"
                            ? "📍"
                            : fav.category === "quote"
                            ? "💭"
                            : "🔗"}
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
              <Text color="$color" fontSize={18} fontWeight="700">
                Latest Update
              </Text>
              <Stack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$4"
              >
                <YStack gap="$2">
                  <XStack gap="$2" alignItems="center">
                    <Text fontSize={24}>
                      {latestNotification.type === "sticker"
                        ? "🎨"
                        : latestNotification.type === "favorite"
                        ? "⭐"
                        : latestNotification.type === "todo"
                        ? "✓"
                        : "🔔"}
                    </Text>
                    <Text
                      color="$color"
                      fontSize={16}
                      fontWeight="700"
                      flex={1}
                    >
                      {latestNotification.title}
                    </Text>
                  </XStack>
                  <Text color="$muted" fontSize={14}>
                    {latestNotification.message}
                  </Text>
                  <Text color="$muted" fontSize={12}>
                    {new Date(latestNotification.createdAt).toLocaleString()}
                  </Text>
                </YStack>
              </Stack>
            </YStack>
          )}

          {/* Empty State */}
          {!latestNotification &&
            upcomingTodos.length === 0 &&
            recentFavorites.length === 0 && (
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
                  Start by adding todos, favorites, or sending stickers to your
                  partner
                </Text>
              </YStack>
            )}

          {/* Bottom Padding */}
          <Stack height={20} />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
