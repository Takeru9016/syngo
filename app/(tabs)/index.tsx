import { useState, useMemo } from "react";
import { RefreshControl } from "react-native";
import { router } from "expo-router";
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
import {
  Heart,
  Bell,
  CheckSquare,
  Star,
  Smile,
  Flame,
} from "@tamagui/lucide-icons";

import { useProfileStore } from "@/store/profile";
import { useAppNotifications, useMarkAsRead } from "@/hooks/useAppNotification";
import { AppNotification } from "@/types";
import { ScreenContainer } from "@/components";
import { triggerLightHaptic, triggerSelectionHaptic } from "@/state/haptics";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  if (hour < 21) return "Good evening";
  else return "Good night";
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};

const getNotifIcon = (type: AppNotification["type"]) => {
  if (type === "todo_reminder") return CheckSquare;
  if (type === "sticker_sent") return Smile;
  if (type === "favorite_added") return Star;
  return Bell;
};

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

  const todayStats = useMemo(() => {
    if (!notifications.length) {
      return {
        updatesToday: 0,
        stickersThisWeek: 0,
      };
    }
    const now = new Date();
    const todayDateStr = now.toDateString();
    const updatesToday = notifications.filter((n) => {
      const d = new Date(n.createdAt);
      return d.toDateString() === todayDateStr;
    }).length;

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const stickersThisWeek = notifications.filter(
      (n) =>
        n.type === "sticker_sent" &&
        new Date(n.createdAt).getTime() >= weekAgo.getTime()
    ).length;

    return { updatesToday, stickersThisWeek };
  }, [notifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    triggerLightHaptic();
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = (notif: AppNotification) => {
    triggerSelectionHaptic();
    if (!notif.read) {
      markAsRead.mutate(notif.id);
    }
    if (notif.type === "todo_reminder") {
      router.push("/(tabs)/todos");
    } else if (notif.type === "sticker_sent") {
      router.push("/(tabs)/stickers");
    } else if (notif.type === "favorite_added") {
      router.push("/(tabs)/favorites");
    }
  };

  const greeting = getGreeting();
  const displayName = profile?.displayName || "you";

  // Fake “connection streak” for now – can be real later
  const connectionStreakDays = Math.max(1, Math.min(7, unreadCount ? 2 : 3));

  return (
    <ScreenContainer title="Home">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <YStack flex={1} padding="$5" paddingTop="$6" gap="$5">
          {/* Hero Couple Card  */}
          <Stack
            borderRadius="$8"
            padding="$5"
            overflow="hidden"
            backgroundColor="$primarySoft"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <XStack gap="$4" alignItems="center">
              <YStack flex={1} gap="$2">
                <XStack alignItems="center" gap="$2">
                  <Heart
                    size={16}
                    color="#ffffff"
                    fill="rgba(255,255,255,0.7)"
                  />
                  <Text
                    fontFamily="$body"
                    color="$colorMuted"
                    fontSize={13}
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing={0.6}
                  >
                    {greeting}
                  </Text>
                </XStack>

                <Text
                  fontFamily="$heading"
                  color="$color"
                  fontSize={24}
                  fontWeight="700"
                  lineHeight={30}
                >
                  {displayName} &{" "}
                  {partner?.displayName ? partner.displayName : "your partner"}
                </Text>

                <Text
                  fontFamily="$body"
                  color="$colorMuted"
                  fontSize={14}
                  lineHeight={20}
                >
                  {todayStats.updatesToday > 0
                    ? `${todayStats.updatesToday} update${
                        todayStats.updatesToday > 1 ? "s" : ""
                      } today • ${unreadCount} unread`
                    : unreadCount > 0
                    ? `${unreadCount} unread update${
                        unreadCount > 1 ? "s" : ""
                      } waiting`
                    : "No new updates yet – send something sweet today."}
                </Text>
              </YStack>

              {/* Partner avatar / initials */}
              <Stack alignItems="center" gap="$2">
                <Stack
                  width={60}
                  height={60}
                  borderRadius={30}
                  overflow="hidden"
                  backgroundColor="$bgCard"
                  borderWidth={2}
                  borderColor="$primary"
                  alignItems="center"
                  justifyContent="center"
                >
                  {partner?.avatarUrl ? (
                    <Image
                      source={{ uri: partner.avatarUrl }}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Text
                      fontFamily="$heading"
                      color="$primary"
                      fontSize={26}
                      fontWeight="700"
                    >
                      {partner?.displayName
                        ? partner.displayName.charAt(0).toUpperCase()
                        : "?"}
                    </Text>
                  )}
                </Stack>
                <Text
                  fontFamily="$body"
                  color="$colorMuted"
                  fontSize={11}
                  textAlign="center"
                >
                  Connected
                </Text>
              </Stack>
            </XStack>
          </Stack>

          {/* Today at a glance */}
          <YStack gap="$2">
            <Text
              fontFamily="$heading"
              color="$color"
              fontSize={18}
              fontWeight="700"
            >
              Today at a glance
            </Text>
            <XStack gap="$2" flexWrap="wrap">
              <StatPill
                label="Updates today"
                value={todayStats.updatesToday}
                icon={Bell}
                tone="primary"
              />
              <StatPill
                label="Unread"
                value={unreadCount}
                icon={Bell}
                tone={unreadCount > 0 ? "highlight" : "neutral"}
              />
              <StatPill
                label="Stickers this week"
                value={todayStats.stickersThisWeek}
                icon={Smile}
                tone="soft"
              />
            </XStack>
          </YStack>

          {/* Notifications mini-timeline */}
          <Stack paddingTop="$3" paddingBottom="$2">
            <YStack gap="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <Text
                  fontFamily="$heading"
                  color="$color"
                  fontSize={18}
                  fontWeight="700"
                >
                  Latest updates
                </Text>
                {unreadCount > 0 && (
                  <XStack alignItems="center" gap="$1">
                    <Stack
                      width={8}
                      height={8}
                      borderRadius={4}
                      backgroundColor="$primary"
                    />
                    <Text fontFamily="$body" color="$colorMuted" fontSize={12}>
                      {unreadCount} unread
                    </Text>
                  </XStack>
                )}
              </XStack>

              {isLoading ? (
                <YStack gap="$2.5">
                  {[1, 2, 3].map((i) => (
                    <Stack
                      key={i}
                      backgroundColor="$bgCard"
                      borderRadius="$6"
                      padding="$3"
                      borderWidth={1}
                      borderColor="$borderColor"
                      alignItems="center"
                      justifyContent="center"
                      height={68}
                    >
                      <Spinner size="small" color="$primary" />
                    </Stack>
                  ))}
                </YStack>
              ) : latestNotifications.length > 0 ? (
                <YStack gap="$2.5">
                  {latestNotifications.map((notif, index) => {
                    const createdAt = new Date(notif.createdAt);
                    const relativeTime = formatRelativeTime(createdAt);
                    const isLast = index === latestNotifications.length - 1;
                    const Icon = getNotifIcon(notif.type);

                    return (
                      <Button
                        key={notif.id}
                        unstyled
                        onPress={() => handleNotificationPress(notif)}
                        pressStyle={{ opacity: 0.7, scale: 0.98 }}
                      >
                        <XStack gap="$2.5">
                          {/* Timeline column */}
                          <YStack alignItems="center" width={16}>
                            <Stack
                              width={10}
                              height={10}
                              borderRadius={5}
                              backgroundColor={
                                notif.read ? "$borderColor" : "$primary"
                              }
                            />
                            {!isLast && (
                              <Stack
                                marginTop="$1"
                                marginBottom="$1"
                                width={2}
                                flex={1}
                                backgroundColor="$borderColor"
                              />
                            )}
                          </YStack>

                          {/* Content card */}
                          <Stack
                            flex={1}
                            backgroundColor="$bgCard"
                            borderRadius="$7"
                            padding="$3"
                            borderWidth={1}
                            borderColor="$borderColor"
                            margin="$1"
                            opacity={notif.read ? 0.7 : 1}
                          >
                            <XStack gap="$2" alignItems="flex-start">
                              <Stack
                                width={28}
                                height={28}
                                borderRadius={14}
                                backgroundColor="$primarySoft"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Icon
                                  size={16}
                                  color={notif.read ? "#A28A82" : "$primary"}
                                />
                              </Stack>
                              <YStack flex={1} gap="$1">
                                <Text
                                  fontFamily="$body"
                                  color="$color"
                                  fontSize={15}
                                  fontWeight="700"
                                  numberOfLines={1}
                                >
                                  {notif.title}
                                </Text>
                                <Text
                                  fontFamily="$body"
                                  color="$colorMuted"
                                  fontSize={13}
                                  numberOfLines={2}
                                  lineHeight={18}
                                >
                                  {notif.body}
                                </Text>
                                <Text
                                  fontFamily="$body"
                                  color="$colorMuted"
                                  fontSize={11}
                                  marginTop="$0.5"
                                >
                                  {relativeTime}
                                </Text>
                              </YStack>
                            </XStack>
                          </Stack>
                        </XStack>
                      </Button>
                    );
                  })}

                  <Button
                    marginTop="$3"
                    backgroundColor="transparent"
                    borderRadius="$8"
                    borderWidth={1}
                    borderColor="$primary"
                    height={46}
                    onPress={() => {
                      triggerSelectionHaptic();
                      router.push("/(tabs)/notification");
                    }}
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  >
                    <XStack
                      alignItems="center"
                      justifyContent="center"
                      gap="$2"
                    >
                      <Bell size={16} color="$primary" />
                      <Text
                        fontFamily="$body"
                        color="$primary"
                        fontSize={15}
                        fontWeight="700"
                      >
                        View all updates
                      </Text>
                    </XStack>
                  </Button>
                </YStack>
              ) : (
                <Stack
                  backgroundColor="$bgCard"
                  borderRadius="$7"
                  padding="$4"
                  alignItems="center"
                  gap="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Stack
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor="$primarySoft"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Bell size={20} color="$primary" />
                  </Stack>
                  <YStack gap="$1" alignItems="center">
                    <Text
                      fontFamily="$heading"
                      color="$color"
                      fontSize={17}
                      fontWeight="700"
                    >
                      No notifications yet
                    </Text>
                    <Text
                      fontFamily="$body"
                      color="$colorMuted"
                      fontSize={14}
                      textAlign="center"
                    >
                      You'll see reminders, stickers, and favorites from your
                      partner here.
                    </Text>
                  </YStack>
                </Stack>
              )}
            </YStack>
          </Stack>

          {/* Connection card (replacing Quick Actions) */}
          <Stack
            marginTop="$4"
            marginBottom="$4"
            backgroundColor="$bgCard"
            borderRadius="$8"
            padding="$4"
            borderWidth={1}
            borderColor="$borderColor"
            gap="$3"
          >
            <XStack alignItems="center" gap="$3">
              <Stack
                width={32}
                height={32}
                borderRadius={16}
                backgroundColor="$primarySoft"
                alignItems="center"
                justifyContent="center"
              >
                <Flame size={18} color="$primary" />
              </Stack>
              <YStack flex={1}>
                <Text
                  fontFamily="$heading"
                  color="$color"
                  fontSize={18}
                  fontWeight="700"
                >
                  Keep the connection going
                </Text>
                {/* For next version to be implemented */}
                {/* <Text
                  fontFamily="$body"
                  color="$colorMuted"
                  fontSize={13}
                  lineHeight={18}
                >
                  {connectionStreakDays}-day streak of staying in touch. Do one
                  tiny thing today.
                </Text> */}
              </YStack>
            </XStack>

            <Button
              marginTop="$2"
              borderRadius="$7"
              backgroundColor="$primary"
              height={48}
              onPress={() => {
                triggerSelectionHaptic();
                router.push("/(tabs)/todos");
              }}
              pressStyle={{ opacity: 0.9, scale: 0.98 }}
            >
              <XStack alignItems="center" justifyContent="center" gap="$2">
                <CheckSquare size={18} color="#ffffff" />
                <Text
                  fontFamily="$body"
                  color="white"
                  fontSize={15}
                  fontWeight="700"
                >
                  Do something nice now
                </Text>
              </XStack>
            </Button>

            <XStack marginTop="$1" gap="$6" alignSelf="center">
              <XStack
                alignItems="center"
                gap="$1"
                onPress={() => {
                  triggerSelectionHaptic();
                  router.push("/(tabs)/stickers");
                }}
              >
                <Smile size={16} color="$primary" />
                <Text fontFamily="$body" color="$primary" fontSize={13}>
                  Send a sticker
                </Text>
              </XStack>

              <XStack
                alignItems="center"
                gap="$1"
                onPress={() => {
                  triggerSelectionHaptic();
                  router.push("/(tabs)/favorites");
                }}
              >
                <Star size={16} color="$primary" />
                <Text fontFamily="$body" color="$primary" fontSize={13}>
                  Save a favorite
                </Text>
              </XStack>
            </XStack>
          </Stack>
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}

type StatPillProps = {
  label: string;
  value: number;
  tone: "primary" | "highlight" | "soft" | "neutral";
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const StatPill = ({ label, value, tone, icon: Icon }: StatPillProps) => {
  let bg: string = "$bgCard";
  let color: string = "$color";

  if (tone === "primary") {
    bg = "$primarySoft";
    color = "$primary";
  } else if (tone === "highlight") {
    bg = value > 0 ? "$primarySoft" : "$bgCard";
    color = value > 0 ? "$primary" : "$colorMuted";
  } else if (tone === "soft") {
    bg = "$bgSoft";
    color = "$colorMuted";
  }

  return (
    <XStack
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$6"
      backgroundColor={bg}
      alignItems="center"
      gap="$2"
    >
      <Stack
        width={22}
        height={22}
        borderRadius={11}
        backgroundColor="$bg"
        alignItems="center"
        justifyContent="center"
      >
        <Icon size={14} color={color === "$primary" ? "$primary" : "#888888"} />
      </Stack>
      <Text fontFamily="$body" color={color} fontSize={15} fontWeight="700">
        {value}
      </Text>
      <Text
        fontFamily="$body"
        color="$colorMuted"
        fontSize={12}
        numberOfLines={1}
      >
        {label}
      </Text>
    </XStack>
  );
};
