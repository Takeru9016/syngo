import { useMemo, useState } from "react";
import {
  RefreshControl,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  Stack,
  Spinner
} from "tamagui";
import {
  Bell,
  CheckCheck,
  Trash2,
  AlarmClock,
  CheckCircle2,
  Sticker,
  Star,
  HeartHandshake,
  HeartCrack,
  User,
  X,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useAppNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from "@/hooks/useAppNotification";
import { AppNotification, AppNotificationType } from "@/types";
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
} from "@/state/haptics";
import { useNotificationPreferences } from "@/store/notificationPreference";
import { NotificationCategory } from "@/types/notification-theme.types";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type FilterKey = "all" | "unread";

export function NotificationPanel({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const panelHeight = screenHeight * 0.7;
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
    onClose(); // Close panel first
    switch (notif.type) {
      case "todo_reminder":
      case "todo_completed":
      case "todo_due_soon":
        router.push("/(tabs)/todos");
        break;
      case "sticker_sent":
      case "favorite_added":
        router.push("/(tabs)/moments");
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
    <NotificationCard
      notif={item}
      onPress={handlePress}
      onDelete={handleDelete}
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Stack
          flex={1}
          backgroundColor="rgba(0,0,0,0.5)"
          justifyContent="flex-end"
        >
          <Stack
            backgroundColor="$bg"
            borderTopLeftRadius="$8"
            borderTopRightRadius="$8"
            height={panelHeight}
            paddingBottom={Math.max(insets.bottom, 20)}
          >
            <YStack padding="$5" gap="$3" flex={1}>
              {/* Header */}
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center" gap="$2">
                  <Bell size={18} color="$primary" />
                  <Text
                    color="$color"
                    fontSize={18}
                    fontFamily="$heading"
                    fontWeight="800"
                  >
                    Notifications
                  </Text>
                  {unreadCount > 0 && (
                    <Stack
                      backgroundColor="$primary"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$4"
                    >
                      <Text fontSize={11} fontWeight="700" color="white">
                        {unreadCount}
                      </Text>
                    </Stack>
                  )}
                </XStack>

                <Button
                  unstyled
                  width={36}
                  height={36}
                  borderRadius={18}
                  backgroundColor="$bgSoft"
                  alignItems="center"
                  justifyContent="center"
                  onPress={onClose}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <X size={20} color="$colorMuted" />
                </Button>
              </XStack>

              {/* Actions */}
              {notifications.length > 0 && (
                <XStack gap="$2">
                  {unreadCount > 0 && (
                    <Button
                      flex={1}
                      size="$3"
                      backgroundColor="$bgSoft"
                      borderRadius="$7"
                      paddingHorizontal="$3"
                      height={40}
                      onPress={handleMarkAllAsRead}
                      pressStyle={{ opacity: 0.9, scale: 0.97 }}
                    >
                      <XStack
                        alignItems="center"
                        justifyContent="center"
                        gap="$2"
                      >
                        <CheckCheck size={14} color="$primary" />
                        <Text color="$primary" fontSize={12} fontWeight="700">
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
                    height={40}
                    onPress={handleClearAll}
                    pressStyle={{ opacity: 0.9, scale: 0.97 }}
                  >
                    <XStack
                      alignItems="center"
                      justifyContent="center"
                      gap="$2"
                    >
                      <Trash2 size={14} color="#f44336" />
                      <Text color="#f44336" fontSize={12} fontWeight="700">
                        Clear all
                      </Text>
                    </XStack>
                  </Button>
                </XStack>
              )}

              {/* Filter */}
              <XStack
                alignItems="center"
                justifyContent="space-between"
                gap="$3"
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
              </XStack>

              {/* Content */}
              {isLoading ? (
                <YStack flex={1} alignItems="center" justifyContent="center">
                  <Spinner size="large" color="$primary" />
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
                    width={80}
                    height={80}
                    borderRadius="$8"
                    backgroundColor="$bgSoft"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Bell size={36} color="$primary" />
                  </Stack>
                  <YStack gap="$2" alignItems="center">
                    <Text
                      color="$color"
                      fontSize={16}
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
                      fontSize={13}
                      textAlign="center"
                      maxWidth={260}
                    >
                      Notifications will show up here
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
          </Stack>
        </Stack>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Filter chip component
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
      height={36}
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

// Notification card component
type NotificationCardProps = {
  notif: AppNotification;
  onPress: (notif: AppNotification) => void;
  onDelete: (id: string) => void;
};

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
  const { customization } = useNotificationPreferences();
  const category = getCategory(notif.type);
  const colors = customization.colors[category];
  const visualStyle = customization.visualStyle;
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

  const createdAtLabel = new Date(notif.createdAt).toLocaleString();
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
      default:
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
      };
    case "todo_completed":
      return {
        icon: (props: any) => <CheckCircle2 {...props} />,
      };
    case "sticker_sent":
      return {
        icon: (props: any) => <Sticker {...props} />,
      };
    case "favorite_added":
      return {
        icon: (props: any) => <Star {...props} />,
      };
    case "pair_success":
    case "pair_request":
      return {
        icon: (props: any) => <HeartHandshake {...props} />,
      };
    case "unpair":
      return {
        icon: (props: any) => <HeartCrack {...props} />,
      };
    case "profile_updated":
      return {
        icon: (props: any) => <User {...props} />,
      };
    default:
      return {
        icon: (props: any) => <Bell {...props} />,
      };
  }
}
