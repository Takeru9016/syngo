import { useState, useMemo, useEffect } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

import { useProfileStore } from "@/store/profile";
import { useAppNotifications, useMarkAsRead } from "@/hooks/useAppNotification";
import { usePartnerMood, useTodayMood } from "@/hooks/useMood";
import { AppNotification, AppNotificationType } from "@/types";
import {
  ScreenContainer,
  NudgeButton,
  NotificationBell,
  NotificationPanel,
  MoodWidget,
} from "@/components";
import { triggerLightHaptic, triggerSelectionHaptic } from "@/state/haptics";
import { useNotificationPreferences } from "@/store/notificationPreference";
import { NotificationCategory } from "@/types/notification-theme.types";

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
  if (type === "nudge") return Heart;
  return Bell;
};

// Map notification types to categories for customization
const getCategory = (type: AppNotificationType): NotificationCategory => {
  switch (type) {
    case "nudge":
      return "nudges";
    case "sticker_sent":
      return "stickers";
    case "todo_reminder":
    case "todo_created":
    case "todo_completed":
    case "todo_due_soon":
      return "todos";
    case "favorite_added":
      return "favorites";
    default:
      return "system";
  }
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
  const { data: partnerMood } = usePartnerMood();
  const { data: todayMood } = useTodayMood();
  const { customization, getStyleForCategory } = useNotificationPreferences();
  const [refreshing, setRefreshing] = useState(false);
  const [notifPanelVisible, setNotifPanelVisible] = useState(false);

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
    } else if (
      notif.type === "sticker_sent" ||
      notif.type === "favorite_added"
    ) {
      router.push("/(tabs)/moments");
    }
  };

  const greeting = getGreeting();
  const displayName = profile?.displayName || "you";

  // Fake “connection streak” for now – can be real later
  // const connectionStreakDays = Math.max(1, Math.min(7, unreadCount ? 2 : 3));

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <YStack flex={1} padding="$5" paddingTop="$2" gap="$5">
          {/* Header */}
          <XStack
            marginTop="$4"
            marginBottom="$2"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text
              fontFamily="$heading"
              color="$color"
              fontSize={30}
              fontWeight="800"
            >
              Home
            </Text>
            <NotificationBell onPress={() => setNotifPanelVisible(true)} />
          </XStack>

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

          {/* Mood Widget */}
          <MoodWidget
            myMood={todayMood}
            partnerMood={partnerMood}
            partnerName={partner?.displayName}
            onPress={() => router.push("/(tabs)/mood")}
          />

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
                    const category = getCategory(notif.type);
                    const colors = customization.colors[category];
                    const visualStyle = getStyleForCategory(category);
                    const useCustomStyle = !notif.read;

                    const renderBackground = () => {
                      if (!useCustomStyle) return null;

                      switch (visualStyle) {
                        case "gradient":
                          return (
                            <LinearGradient
                              colors={[
                                colors.background,
                                colors.backgroundSecondary || colors.background,
                              ]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: 16,
                              }}
                            />
                          );

                        case "glassmorphic":
                          return (
                            <>
                              <Stack
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                backgroundColor={colors.background}
                                opacity={0.9}
                                borderRadius={16}
                              />
                              <Stack
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                borderWidth={1}
                                borderColor={`${colors.accent}40`}
                                borderRadius={16}
                              />
                            </>
                          );

                        default: // solid
                          return (
                            <Stack
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              bottom={0}
                              backgroundColor={colors.background}
                              borderRadius={16}
                            />
                          );
                      }
                    };

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
                                notif.read ? "$borderColor" : colors.accent
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
                            backgroundColor={
                              notif.read ? "$bgCard" : "transparent"
                            }
                            borderRadius="$7"
                            padding="$3"
                            overflow="hidden"
                            margin="$1"
                            style={
                              useCustomStyle
                                ? {
                                    shadowColor: colors.accent,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 6,
                                    elevation: 3,
                                  }
                                : undefined
                            }
                          >
                            {renderBackground()}

                            <XStack gap="$2" alignItems="flex-start" zIndex={1}>
                              <Stack
                                width={30}
                                height={30}
                                borderRadius={10}
                                backgroundColor={
                                  useCustomStyle
                                    ? `${colors.icon}25`
                                    : "$primarySoft"
                                }
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Icon
                                  size={16}
                                  color={
                                    useCustomStyle
                                      ? colors.icon
                                      : notif.read
                                      ? "#A28A82"
                                      : "$primary"
                                  }
                                />
                              </Stack>
                              <YStack flex={1} gap="$1">
                                <Text
                                  fontFamily="$body"
                                  color={
                                    useCustomStyle ? colors.text : "$color"
                                  }
                                  fontSize={15}
                                  fontWeight="700"
                                  numberOfLines={1}
                                >
                                  {notif.title}
                                </Text>
                                <Text
                                  fontFamily="$body"
                                  color={
                                    useCustomStyle ? colors.text : "$colorMuted"
                                  }
                                  opacity={useCustomStyle ? 0.85 : 1}
                                  fontSize={13}
                                  numberOfLines={2}
                                  lineHeight={18}
                                >
                                  {notif.body}
                                </Text>
                                <Text
                                  fontFamily="$body"
                                  color={
                                    useCustomStyle ? colors.text : "$colorMuted"
                                  }
                                  opacity={useCustomStyle ? 0.6 : 1}
                                  fontSize={11}
                                  marginTop="$0.5"
                                >
                                  {relativeTime}
                                </Text>
                              </YStack>
                            </XStack>

                            {/* Accent bar for unread */}
                            {useCustomStyle && (
                              <Stack
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                width={3}
                                backgroundColor={colors.accent}
                                borderTopLeftRadius={16}
                                borderBottomLeftRadius={16}
                              />
                            )}
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
                      setNotifPanelVisible(true);
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
                      You&apos;ll see reminders, stickers, and favorites from
                      your partner here.
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

            <XStack marginTop="$1" gap="$4" alignSelf="center">
              <XStack
                alignItems="center"
                gap="$1"
                padding="$2"
                onPress={() => {
                  triggerSelectionHaptic();
                  router.push("/(tabs)/moments");
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
                padding="$2"
                onPress={() => {
                  triggerSelectionHaptic();
                  router.push("/(tabs)/moments");
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

      {/* Floating Nudge Button */}
      <NudgeButton />

      {/* Notification Panel */}
      <NotificationPanel
        visible={notifPanelVisible}
        onClose={() => setNotifPanelVisible(false)}
      />
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
