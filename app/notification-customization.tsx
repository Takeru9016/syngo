import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Stack, Text, XStack, YStack, Button, useTheme } from "tamagui";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Palette,
  Vibrate,
  Square,
  Layers,
  Sparkles,
  RotateCcw,
  Heart,
  Sticker,
  CheckSquare,
  Star,
  Bell,
} from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenContainer } from "@/components";
import { NotificationPreview } from "@/components/Notifications/NotificationPreview";
import { useNotificationPreferences } from "@/store/notificationPreference";
import {
  NotificationCategory,
  NotificationVisualStyle,
  VibrationPatternName,
  NOTIFICATION_THEME_PRESETS,
  VIBRATION_PATTERNS,
} from "@/types/notification-theme.types";
import {
  triggerLightHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
} from "@/state/haptics";
import * as Haptics from "expo-haptics";

const CATEGORY_CONFIG = [
  { id: "nudges" as NotificationCategory, label: "Nudges", icon: Heart },
  { id: "stickers" as NotificationCategory, label: "Stickers", icon: Sticker },
  { id: "todos" as NotificationCategory, label: "Todos", icon: CheckSquare },
  { id: "favorites" as NotificationCategory, label: "Favorites", icon: Star },
  { id: "system" as NotificationCategory, label: "System", icon: Bell },
];

const VIBRATION_OPTIONS: {
  id: VibrationPatternName;
  label: string;
  description: string;
}[] = [
  { id: "default", label: "Default", description: "Standard notification" },
  { id: "gentle", label: "Gentle", description: "Subtle single tap" },
  { id: "strong", label: "Strong", description: "Double strong pulse" },
  { id: "heartbeat", label: "Heartbeat", description: "Rhythmic pattern" },
  { id: "double", label: "Double", description: "Quick double tap" },
  { id: "none", label: "None", description: "No vibration" },
];

const STYLE_OPTIONS: {
  id: NotificationVisualStyle;
  label: string;
  icon: any;
}[] = [
  { id: "solid", label: "Solid", icon: Square },
  { id: "gradient", label: "Gradient", icon: Layers },
  { id: "glassmorphic", label: "Glass", icon: Sparkles },
];

export default function NotificationCustomization() {
  const theme = useTheme();
  const router = useRouter();
  const {
    customization,
    applyPreset,
    updateCustomization,
    resetCustomization,
  } = useNotificationPreferences();

  const [selectedCategory, setSelectedCategory] =
    useState<NotificationCategory>("nudges");
  const [previewKey, setPreviewKey] = useState(0);

  const handlePresetSelect = async (presetId: string) => {
    triggerSuccessHaptic();
    await applyPreset(presetId);
    setPreviewKey((k) => k + 1);
  };

  const handleStyleChange = async (style: NotificationVisualStyle) => {
    triggerLightHaptic();
    await updateCustomization({ visualStyle: style });
    setPreviewKey((k) => k + 1);
  };

  const handleVibrationChange = async (pattern: VibrationPatternName) => {
    triggerLightHaptic();
    // Play the vibration pattern
    const patternArray = VIBRATION_PATTERNS[pattern];
    if (patternArray.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await updateCustomization({ vibrationPattern: pattern });
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Customization",
      "This will restore all notification styles to default. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            triggerWarningHaptic();
            await resetCustomization();
            setPreviewKey((k) => k + 1);
          },
        },
      ]
    );
  };

  const currentColors = customization.colors[selectedCategory];

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack flex={1} padding="$4" paddingTop="$2" gap="$5">
          {/* Header */}
          <XStack alignItems="center" gap="$3">
            <Button
              size="$3"
              circular
              backgroundColor="$bgSoft"
              onPress={() => {
                triggerLightHaptic();
                router.back();
              }}
              pressStyle={{ opacity: 0.8, scale: 0.95 }}
            >
              <ChevronLeft size={20} color="$color" />
            </Button>
            <YStack flex={1}>
              <Text
                color="$color"
                fontSize={20}
                fontFamily="$heading"
                fontWeight="800"
              >
                Customize Notifications
              </Text>
              <Text color="$muted" fontSize={13}>
                Make them uniquely yours
              </Text>
            </YStack>
            <Button
              size="$3"
              circular
              backgroundColor="$bgSoft"
              onPress={handleReset}
              pressStyle={{ opacity: 0.8, scale: 0.95 }}
            >
              <RotateCcw size={18} color="$muted" />
            </Button>
          </XStack>

          {/* Live Preview */}
          <YStack gap="$3">
            <XStack alignItems="center" gap="$2">
              <Palette size={16} color="$primary" />
              <Text
                color="$color"
                fontSize={14}
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                Live Preview
              </Text>
            </XStack>

            <Stack backgroundColor="$bgSoft" borderRadius="$6" padding="$4">
              <NotificationPreview
                key={previewKey}
                category={selectedCategory}
                colors={currentColors}
                visualStyle={customization.visualStyle}
                borderRadius={customization.borderRadius}
                shadowIntensity={customization.shadowIntensity}
                animate={true}
              />
            </Stack>

            {/* Category Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {CATEGORY_CONFIG.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    height={36}
                    paddingHorizontal="$3"
                    backgroundColor={isActive ? "$primary" : "$bgSoft"}
                    borderRadius="$6"
                    onPress={() => {
                      triggerLightHaptic();
                      setSelectedCategory(cat.id);
                      setPreviewKey((k) => k + 1);
                    }}
                    pressStyle={{ opacity: 0.9, scale: 0.97 }}
                  >
                    <XStack gap="$2" alignItems="center">
                      <Icon size={14} color={isActive ? "white" : "$muted"} />
                      <Text
                        color={isActive ? "white" : "$color"}
                        fontSize={13}
                        fontWeight="600"
                      >
                        {cat.label}
                      </Text>
                    </XStack>
                  </Button>
                );
              })}
            </ScrollView>
          </YStack>

          {/* Theme Presets */}
          <YStack gap="$3">
            <Text
              color="$color"
              fontSize={14}
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              Theme Presets
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {NOTIFICATION_THEME_PRESETS.map((preset) => {
                const isActive = customization.activePreset === preset.id;
                const previewColors = preset.colors.nudges;
                return (
                  <Button
                    key={preset.id}
                    width={120}
                    height={100}
                    padding="$0"
                    borderRadius="$5"
                    overflow="hidden"
                    borderWidth={isActive ? 2 : 0}
                    borderColor={isActive ? "$primary" : "transparent"}
                    onPress={() => handlePresetSelect(preset.id)}
                    pressStyle={{ opacity: 0.9, scale: 0.97 }}
                  >
                    {preset.visualStyle === "gradient" ? (
                      <LinearGradient
                        colors={[
                          previewColors.background,
                          previewColors.backgroundSecondary ||
                            previewColors.background,
                        ]}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                      />
                    ) : (
                      <Stack
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        backgroundColor={previewColors.background}
                      />
                    )}
                    <YStack flex={1} justifyContent="flex-end" padding="$2">
                      <Text
                        color={previewColors.text}
                        fontSize={12}
                        fontWeight="700"
                      >
                        {preset.name}
                      </Text>
                      <Text
                        color={previewColors.text}
                        fontSize={10}
                        opacity={0.7}
                        numberOfLines={1}
                      >
                        {preset.description}
                      </Text>
                    </YStack>
                    {isActive && (
                      <Stack
                        position="absolute"
                        top={8}
                        right={8}
                        width={20}
                        height={20}
                        borderRadius={10}
                        backgroundColor="white"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Stack
                          width={10}
                          height={10}
                          borderRadius={5}
                          backgroundColor="$primary"
                        />
                      </Stack>
                    )}
                  </Button>
                );
              })}
            </ScrollView>
          </YStack>

          {/* Visual Style */}
          <YStack gap="$3">
            <Text
              color="$color"
              fontSize={14}
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              Visual Style
            </Text>

            <XStack gap="$2">
              {STYLE_OPTIONS.map((style) => {
                const isActive = customization.visualStyle === style.id;
                const Icon = style.icon;
                return (
                  <Button
                    key={style.id}
                    flex={1}
                    height={56}
                    backgroundColor={isActive ? "$primary" : "$bgSoft"}
                    borderRadius="$5"
                    onPress={() => handleStyleChange(style.id)}
                    pressStyle={{ opacity: 0.9, scale: 0.97 }}
                  >
                    <YStack alignItems="center" gap="$1">
                      <Icon size={20} color={isActive ? "white" : "$muted"} />
                      <Text
                        color={isActive ? "white" : "$color"}
                        fontSize={12}
                        fontWeight="600"
                      >
                        {style.label}
                      </Text>
                    </YStack>
                  </Button>
                );
              })}
            </XStack>
          </YStack>

          {/* Vibration Pattern */}
          <YStack gap="$3" paddingBottom="$4">
            <XStack alignItems="center" gap="$2">
              <Vibrate size={16} color="$primary" />
              <Text
                color="$color"
                fontSize={14}
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                Vibration Pattern
              </Text>
            </XStack>

            <YStack gap="$2">
              {VIBRATION_OPTIONS.map((option) => {
                const isActive = customization.vibrationPattern === option.id;
                return (
                  <Button
                    key={option.id}
                    height={52}
                    backgroundColor={isActive ? "$primary" : "$bgSoft"}
                    borderRadius="$5"
                    paddingHorizontal="$4"
                    onPress={() => handleVibrationChange(option.id)}
                    pressStyle={{ opacity: 0.9, scale: 0.98 }}
                  >
                    <XStack
                      flex={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <YStack>
                        <Text
                          color={isActive ? "white" : "$color"}
                          fontSize={14}
                          fontWeight="600"
                        >
                          {option.label}
                        </Text>
                        <Text
                          color={isActive ? "white" : "$muted"}
                          fontSize={11}
                          opacity={isActive ? 0.8 : 1}
                        >
                          {option.description}
                        </Text>
                      </YStack>
                      {isActive && (
                        <Stack
                          width={20}
                          height={20}
                          borderRadius={10}
                          backgroundColor="white"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Stack
                            width={10}
                            height={10}
                            borderRadius={5}
                            backgroundColor="$primary"
                          />
                        </Stack>
                      )}
                    </XStack>
                  </Button>
                );
              })}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}
