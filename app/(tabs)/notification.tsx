import { useMemo, useState, useRef } from "react";
import {
  RefreshControl,
  Alert,
  FlatList,
  ListRenderItem,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { YStack, XStack, Text, Button, Stack, Spinner, Image } from "tamagui";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlarmClock,
  CheckCircle2,
  Check,
  Sticker,
  Star,
  HeartHandshake,
  HeartCrack,
  User,
  Heart,
  Smile,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import {
  useAppNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "@/hooks/useAppNotification";
import { AppNotification, AppNotificationType } from "@/types";
import { ScreenContainer } from "@/components";
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
} from "@/state/haptics";
import { useNotificationPreferences } from "@/store/notificationPreference";
import { NotificationCategory } from "@/types/notification-theme.types";
import { formatRelativeTime } from "@/utils/dateFormat";

type FilterKey = "all" | "unread";

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
  const [filter, setFilter] = useState<FilterKey>("all");

  const handleRefresh = async () => {
    setRefreshing(true);
    triggerLightHaptic();
    await refetch();
    setRefreshing(false);
  };

  const handlePress = async (notif: AppNotification) => {
    triggerLightHaptic();
    if (!notif.read) {
      markAsRead.mutate(notif.id);
    }
    switch (notif.type) {
      case "todo_reminder":
      case "todo_completed":
      case "todo_due_soon":
        router.push("/(tabs)/todos");
        break;
      case "sticker_sent":
        router.push("/(tabs)/stickers");
        break;
      case "favorite_added":
        router.push("/(tabs)/favorites");
        break;
      case "pair_success":
      case "pair_request":
        router.push("/(tabs)");
        break;
      case "profile_updated":
        router.push("/(tabs)/settings");
        break;
      default:
        break;
    }
  };

  const handleDelete = async (id: string) => {
    triggerWarningHaptic();
    deleteNotification.mutate(id);
  };

  const handleMarkAllAsRead = async () => {
    triggerSuccessHaptic();
    markAllAsRead.mutate();
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear all notifications?",
      "This will remove all notifications for this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear all",
          style: "destructive",
          onPress: async () => {
            triggerWarningHaptic();
            clearAll.mutate();
          },
        },
      ]
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const renderItem: ListRenderItem<AppNotification> = ({ item }) => (
    <SwipeableNotificationCard
      notif={item}
      onPress={handlePress}
      onDelete={handleDelete}
      onMarkAsRead={(id) => markAsRead.mutate(id)}
    />
  );

  return (
    <ScreenContainer scroll={false}>
      <YStack flex={1} paddingTop="$4" gap="$3">
        {/* Hero header */}
        <YStack gap="$2">
          <XStack alignItems="center" gap="$2">
            <Bell size={18} color="$primary" />
            <Text
              color="$color"
              fontSize={18}
              fontFamily="$heading"
              fontWeight="800"
            >
              Activity inbox
            </Text>
          </XStack>
          <Text color="$muted" fontSize={13}>
            Little pings about todos, stickers, and favorites.
          </Text>
        </YStack>

        {/* Primary actions row (now directly under header, full-width) */}
        {notifications.length > 0 && (
          <XStack gap="$2">
            {unreadCount > 0 && (
              <Button
                flex={1}
                size="$3"
                backgroundColor="$bgSoft"
                borderRadius="$7"
                paddingHorizontal="$3"
                height={44}
                onPress={handleMarkAllAsRead}
                pressStyle={{ opacity: 0.9, scale: 0.97 }}
              >
                <XStack alignItems="center" justifyContent="center" gap="$2">
                  <CheckCheck size={16} color="$primary" />
                  <Text color="$primary" fontSize={13} fontWeight="700">
                    Mark all read
                  </Text>
                </XStack>
              </Button>
            )}
            <Button
              flex={1}
              size="$3"
              backgroundColor="$bgSoft"
              borderRadius="$7"
              paddingHorizontal="$3"
              height={44}
              onPress={handleClearAll}
              pressStyle={{ opacity: 0.9, scale: 0.97 }}
            >
              <XStack alignItems="center" justifyContent="center" gap="$2">
                <Trash2 size={16} color="#f44336" />
                <Text color="#f44336" fontSize={13} fontWeight="700">
                  Clear all
                </Text>
              </XStack>
            </Button>
          </XStack>
        )}

        {/* Filter row + summary */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$3"
          marginTop="$1"
        >
          <XStack gap="$2">
            <FilterChip
              label="All"
              active={filter === "all"}
              onPress={() => setFilter("all")}
            />
            <FilterChip
              label={`Unread${unreadCount ? ` (${unreadCount})` : ""}`}
              active={filter === "unread"}
              onPress={() => setFilter("unread")}
            />
          </XStack>

          {notifications.length > 0 && (
            <Text color="$muted" fontSize={12}>
              {notifications.length} total
            </Text>
          )}
        </XStack>

        {/* Content */}
        {isLoading ? (
          <YStack flex={1} paddingTop="$3" gap="$2">
            {[1, 2, 3, 4].map((i) => (
              <Stack
                key={i}
                backgroundColor="$bgSoft"
                borderRadius="$7"
                padding="$3"
                height={72}
                alignItems="center"
                justifyContent="center"
              >
                <Spinner size="small" color="$muted" />
              </Stack>
            ))}
          </YStack>
        ) : filteredNotifications.length === 0 ? (
          <Stack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingVertical="$8"
            gap="$4"
          >
            <Stack
              width={96}
              height={96}
              borderRadius="$8"
              backgroundColor="$bgSoft"
              alignItems="center"
              justifyContent="center"
            >
              <Bell size={40} color="$primary" />
            </Stack>

            <YStack gap="$2" alignItems="center" paddingHorizontal="$6">
              <Text
                color="$color"
                fontSize={18}
                fontWeight="700"
                fontFamily="$heading"
                textAlign="center"
              >
                {notifications.length === 0
                  ? "You're all caught up"
                  : "No unread notifications"}
              </Text>
              <Text
                color="$muted"
                fontSize={14}
                textAlign="center"
                maxWidth={280}
              >
                When todos, stickers, or favorites change, they’ll show up here.
              </Text>
            </YStack>
          </Stack>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <Stack height={10} />}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
          />
        )}
      </YStack>
    </ScreenContainer>
  );
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Button
      size="$2"
      borderRadius="$8"
      paddingHorizontal="$3"
      height={44}
      backgroundColor={active ? "$primarySoft" : "$bgSoft"}
      onPress={onPress}
      pressStyle={{ opacity: 0.9, scale: 0.97 }}
      overflow="hidden"
    >
      <Text
        fontSize={12}
        fontWeight={active ? "700" : "500"}
        color={active ? "$primary" : "$muted"}
      >
        {label}
      </Text>
    </Button>
  );
}

type NotificationCardProps = {
  notif: AppNotification;
  onPress: (notif: AppNotification) => void;
  onDelete: (id: string) => void;
};

type SwipeableNotificationCardProps = NotificationCardProps & {
  onMarkAsRead: (id: string) => void;
};

// Swipeable wrapper component
function SwipeableNotificationCard({
  notif,
  onPress,
  onDelete,
  onMarkAsRead,
}: SwipeableNotificationCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Don't show swipe action for already read notifications
    if (notif.read) return null;

    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    const opacity = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [0, 0.8, 1],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          backgroundColor: "#10B981",
          justifyContent: "center",
          alignItems: "center",
          width: 80,
          borderRadius: 16,
          marginRight: 8,
          opacity,
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Check size={24} color="white" />
        </Animated.View>
        <Animated.Text
          style={{
            color: "white",
            fontSize: 11,
            fontWeight: "600",
            marginTop: 4,
            transform: [{ scale }],
          }}
        >
          Mark Read
        </Animated.Text>
      </Animated.View>
    );
  };

  const handleSwipeOpen = (direction: "left" | "right") => {
    if (direction === "left" && !notif.read) {
      triggerSuccessHaptic();
      onMarkAsRead(notif.id);
      swipeableRef.current?.close();
    }
  };

  // If already read, don't use swipeable
  if (notif.read) {
    return (
      <NotificationCard notif={notif} onPress={onPress} onDelete={onDelete} />
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={handleSwipeOpen}
      leftThreshold={40}
      friction={2}
      overshootLeft={false}
    >
      <NotificationCard notif={notif} onPress={onPress} onDelete={onDelete} />
    </Swipeable>
  );
}

// Map notification types to categories
function getCategory(type: AppNotificationType): NotificationCategory {
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
}

function NotificationCard({ notif, onPress, onDelete }: NotificationCardProps) {
  const { customization, getStyleForCategory } = useNotificationPreferences();
  const category = getCategory(notif.type);
  const colors = customization.colors[category];
  const visualStyle = getStyleForCategory(category);
  const { icon } = getNotificationVisual(notif.type);

  const handleLongPress = () => {
    triggerMediumHaptic();
    Alert.alert(
      "Notification options",
      undefined,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(notif.id),
        },
      ],
      { cancelable: true }
    );
  };

  const createdAtLabel = formatRelativeTime(notif.createdAt);

  // Only apply custom styling to unread notifications
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
      unstyled
      onPress={() => onPress(notif)}
      onLongPress={handleLongPress}
      pressStyle={{ opacity: 0.9, scale: 0.97 }}
    >
      <Stack
        backgroundColor={notif.read ? "$bg" : "transparent"}
        borderRadius="$7"
        padding="$3"
        overflow="hidden"
        style={
          useCustomStyle
            ? {
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }
            : undefined
        }
      >
        {renderBackground()}

        <XStack alignItems="flex-start" gap="$3" zIndex={1}>
          {/* Icon or Image bubble */}
          {(notif.type === "sticker_sent" || notif.type === "favorite_added") &&
          notif.data?.imageUrl ? (
            <Stack
              width={44}
              height={44}
              borderRadius={10}
              overflow="hidden"
              backgroundColor={useCustomStyle ? `${colors.icon}20` : "$bgSoft"}
            >
              <Image
                source={{ uri: notif.data.imageUrl as string }}
                width={44}
                height={44}
                objectFit="cover"
              />
            </Stack>
          ) : (
            <Stack
              width={36}
              height={36}
              borderRadius={10}
              backgroundColor={useCustomStyle ? `${colors.icon}20` : "$bgSoft"}
              alignItems="center"
              justifyContent="center"
            >
              {icon({
                size: 18,
                color: useCustomStyle ? colors.icon : "$primary",
              })}
            </Stack>
          )}

          {/* Text content */}
          <YStack flex={1} gap="$1">
            <Text
              color={useCustomStyle ? colors.text : "$color"}
              fontSize={14}
              fontWeight={notif.read ? "600" : "700"}
            >
              {notif.title}
            </Text>
            <Text
              color={useCustomStyle ? colors.text : "$muted"}
              opacity={useCustomStyle ? 0.85 : 1}
              fontSize={13}
              numberOfLines={2}
            >
              {notif.body}
            </Text>
            <Text
              color={useCustomStyle ? colors.text : "$muted"}
              opacity={useCustomStyle ? 0.6 : 1}
              fontSize={11}
            >
              {createdAtLabel}
            </Text>
          </YStack>

          {/* Unread indicator */}
          {!notif.read && (
            <Stack
              width={8}
              height={8}
              borderRadius={999}
              backgroundColor={colors.accent}
              marginTop="$1"
            />
          )}
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
    </Button>
  );
}

function getNotificationVisual(type: AppNotificationType) {
  switch (type) {
    case "todo_reminder":
    case "todo_due_soon":
      return {
        icon: (props: any) => <AlarmClock {...props} />,
        iconBg: "$primarySoft",
        iconColor: "$primary",
      };
    case "todo_completed":
      return {
        icon: (props: any) => <CheckCircle2 {...props} />,
        iconBg: "$successSoft",
        iconColor: "$success",
      };
    case "sticker_sent":
      return {
        icon: (props: any) => <Sticker {...props} />,
        iconBg: "$accentSoft",
        iconColor: "$accent",
      };
    case "favorite_added":
      return {
        icon: (props: any) => <Star {...props} />,
        iconBg: "$accentSoft",
        iconColor: "$accent",
      };
    case "pair_success":
    case "pair_request":
      return {
        icon: (props: any) => <HeartHandshake {...props} />,
        iconBg: "$primarySoft",
        iconColor: "$primary",
      };
    case "unpair":
      return {
        icon: (props: any) => <HeartCrack {...props} />,
        iconBg: "$dangerSoft",
        iconColor: "$danger",
      };
    case "profile_updated":
      return {
        icon: (props: any) => <User {...props} />,
        iconBg: "$bgSoft",
        iconColor: "$muted",
      };
    case "mood_updated":
      return {
        icon: (props: any) => <Smile {...props} />,
        iconBg: "$primarySoft",
        iconColor: "$primary",
      };
    default:
      return {
        icon: (props: any) => <Bell {...props} />,
        iconBg: "$bgSoft",
        iconColor: "$muted",
      };
  }
}
