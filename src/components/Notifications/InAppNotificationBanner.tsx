import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { Stack, Text, XStack, YStack, Image } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Heart,
  Sticker,
  CheckSquare,
  Star,
  Bell,
  HeartHandshake,
  X,
  Smile,
} from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";

import { useNotificationPreferences } from "@/store/notificationPreference";
import { NotificationCategory } from "@/types/notification-theme.types";
import { AppNotificationType } from "@/types";

interface InAppNotificationBannerProps {
  visible: boolean;
  title: string;
  body: string;
  type: AppNotificationType;
  imageUrl?: string;
  onPress?: () => void;
  onDismiss?: () => void;
  autoDismissMs?: number;
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
    case "mood_updated":
      return "system"; // Use system styling for mood updates
    default:
      return "system";
  }
}

// Get icon for notification type
function getIcon(type: AppNotificationType) {
  switch (type) {
    case "nudge":
      return Heart;
    case "sticker_sent":
      return Sticker;
    case "todo_reminder":
    case "todo_created":
    case "todo_completed":
    case "todo_due_soon":
      return CheckSquare;
    case "favorite_added":
      return Star;
    case "pair_success":
    case "pair_connected":
    case "pair_request":
    case "pair_accepted":
      return HeartHandshake;
    case "mood_updated":
      return Smile;
    default:
      return Bell;
  }
}

export function InAppNotificationBanner({
  visible,
  title,
  body,
  type,
  imageUrl,
  onPress,
  onDismiss,
  autoDismissMs = 4000,
}: InAppNotificationBannerProps) {
  const insets = useSafeAreaInsets();
  const { customization, preferences } = useNotificationPreferences();

  const category = getCategory(type);
  const colors = customization.colors[category];
  const visualStyle = customization.visualStyle;
  const vibrationPattern = customization.vibrationPattern;
  const Icon = getIcon(type);

  // Animation values
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);

      // Play vibration pattern
      if (preferences.vibration && vibrationPattern !== "none") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (autoDismissMs > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -150,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
    handleDismiss();
  };

  if (!isVisible) return null;

  const renderBackground = () => {
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
              borderRadius: customization.borderRadius,
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
              opacity={0.92}
              borderRadius={customization.borderRadius}
            />
            <Stack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              borderWidth={1}
              borderColor={`${colors.accent}50`}
              borderRadius={customization.borderRadius}
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
            borderRadius={customization.borderRadius}
          />
        );
    }
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    >
      <Stack
        overflow="hidden"
        borderRadius={customization.borderRadius}
        onPress={handlePress}
        pressStyle={{ opacity: 0.95, scale: 0.98 }}
        style={{
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: customization.shadowIntensity,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        {renderBackground()}

        <XStack padding="$4" gap="$3" alignItems="center">
          {/* Icon or Image container */}
          {imageUrl ? (
            <Stack
              width={48}
              height={48}
              borderRadius={12}
              overflow="hidden"
              backgroundColor={`${colors.icon}15`}
            >
              <Image
                source={{ uri: imageUrl }}
                width={48}
                height={48}
                objectFit="cover"
              />
            </Stack>
          ) : (
            <Stack
              width={44}
              height={44}
              borderRadius={12}
              backgroundColor={`${colors.icon}25`}
              alignItems="center"
              justifyContent="center"
            >
              <Icon size={22} color={colors.icon} />
            </Stack>
          )}

          {/* Content */}
          <YStack flex={1} gap="$0.5">
            <Text
              color={colors.text}
              fontSize={15}
              fontWeight="700"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              color={colors.text}
              fontSize={13}
              opacity={0.85}
              numberOfLines={2}
            >
              {body}
            </Text>
          </YStack>

          {/* Dismiss button */}
          <Stack
            width={28}
            height={28}
            borderRadius={14}
            backgroundColor={`${colors.text}15`}
            alignItems="center"
            justifyContent="center"
            onPress={(e) => {
              e.stopPropagation?.();
              handleDismiss();
            }}
            pressStyle={{ opacity: 0.7 }}
          >
            <X size={14} color={colors.text} />
          </Stack>
        </XStack>

        {/* Accent bar */}
        <Stack
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          width={4}
          backgroundColor={colors.accent}
          borderTopLeftRadius={customization.borderRadius}
          borderBottomLeftRadius={customization.borderRadius}
        />
      </Stack>
    </Animated.View>
  );
}

// Provider component to manage banner state globally
import { createContext, useContext, useCallback, ReactNode } from "react";

interface BannerState {
  visible: boolean;
  title: string;
  body: string;
  type: AppNotificationType;
  imageUrl?: string;
  onPress?: () => void;
}

interface InAppNotificationContextType {
  showBanner: (options: Omit<BannerState, "visible">) => void;
  hideBanner: () => void;
}

const InAppNotificationContext =
  createContext<InAppNotificationContextType | null>(null);

export function useInAppNotification() {
  const context = useContext(InAppNotificationContext);
  if (!context) {
    throw new Error(
      "useInAppNotification must be used within InAppNotificationProvider"
    );
  }
  return context;
}

interface InAppNotificationProviderProps {
  children: ReactNode;
}

export function InAppNotificationProvider({
  children,
}: InAppNotificationProviderProps) {
  const [banner, setBanner] = useState<BannerState>({
    visible: false,
    title: "",
    body: "",
    type: "other",
  });

  const showBanner = useCallback((options: Omit<BannerState, "visible">) => {
    setBanner({
      ...options,
      visible: true,
    });
  }, []);

  const hideBanner = useCallback(() => {
    setBanner((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <InAppNotificationContext.Provider value={{ showBanner, hideBanner }}>
      {children}
      <InAppNotificationBanner
        visible={banner.visible}
        title={banner.title}
        body={banner.body}
        type={banner.type}
        imageUrl={banner.imageUrl}
        onPress={banner.onPress}
        onDismiss={hideBanner}
      />
    </InAppNotificationContext.Provider>
  );
}
