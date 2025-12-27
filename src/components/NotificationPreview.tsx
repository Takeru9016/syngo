import { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Sticker, CheckSquare, Star, Bell } from "@tamagui/lucide-icons";
import {
  NotificationCategory,
  NotificationColorScheme,
  NotificationVisualStyle,
} from "@/types/notification-theme.types";

interface NotificationPreviewProps {
  category: NotificationCategory;
  colors: NotificationColorScheme;
  visualStyle: NotificationVisualStyle;
  borderRadius?: number;
  shadowIntensity?: number;
  title?: string;
  body?: string;
  animate?: boolean;
}

const CATEGORY_ICONS = {
  nudges: Heart,
  stickers: Sticker,
  todos: CheckSquare,
  favorites: Star,
  system: Bell,
};

const DEFAULT_CONTENT: Record<
  NotificationCategory,
  { title: string; body: string }
> = {
  nudges: {
    title: "Thinking of you",
    body: "Your partner sent you a nudge!",
  },
  stickers: { title: "New Sticker", body: "Alex sent you a cute sticker" },
  todos: { title: "Reminder", body: "Don't forget to call mom!" },
  favorites: {
    title: "New Favorite",
    body: "Added 'Pizza Place' to favorites",
  },
  system: { title: "Syngo", body: "You're now connected" },
};

export function NotificationPreview({
  category,
  colors,
  visualStyle,
  borderRadius = 16,
  shadowIntensity = 0.3,
  title,
  body,
  animate = true,
}: NotificationPreviewProps) {
  const Icon = CATEGORY_ICONS[category];
  const content = DEFAULT_CONTENT[category];
  const displayTitle = title || content.title;
  const displayBody = body || content.body;

  // Animation values
  const slideAnim = useRef(new Animated.Value(animate ? -20 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(animate ? 0.95 : 1)).current;

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animate, colors, visualStyle]);

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
              borderRadius,
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
              opacity={0.85}
              borderRadius={borderRadius}
            />
            <Stack
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              borderWidth={1}
              borderColor={`${colors.accent}40`}
              borderRadius={borderRadius}
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
            borderRadius={borderRadius}
          />
        );
    }
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <Stack
        overflow="hidden"
        borderRadius={borderRadius}
        style={{
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: shadowIntensity,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {renderBackground()}

        <XStack padding="$4" gap="$3" alignItems="center">
          {/* Icon container */}
          <Stack
            width={44}
            height={44}
            borderRadius={12}
            backgroundColor={`${colors.icon}20`}
            alignItems="center"
            justifyContent="center"
          >
            <Icon size={22} color={colors.icon} />
          </Stack>

          {/* Content */}
          <YStack flex={1} gap="$1">
            <Text
              color={colors.text}
              fontSize={15}
              fontWeight="700"
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            <Text
              color={colors.text}
              fontSize={13}
              opacity={0.85}
              numberOfLines={2}
            >
              {displayBody}
            </Text>
          </YStack>

          {/* Time indicator */}
          <Text
            color={colors.text}
            fontSize={11}
            opacity={0.6}
            fontWeight="500"
          >
            now
          </Text>
        </XStack>

        {/* Subtle accent bar */}
        <Stack
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          width={4}
          backgroundColor={colors.accent}
          borderTopLeftRadius={borderRadius}
          borderBottomLeftRadius={borderRadius}
        />
      </Stack>
    </Animated.View>
  );
}
