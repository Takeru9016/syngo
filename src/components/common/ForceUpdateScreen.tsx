/**
 * ForceUpdateScreen Component
 *
 * Blocking fullscreen that appears when the current app version is below
 * the minimum supported version. User must update via app store to continue.
 */

import { Platform, StyleSheet } from "react-native";
import { YStack, XStack, Text, Button, Stack } from "tamagui";
import {
  Download,
  Smartphone,
  ArrowRight,
} from "@tamagui/lucide-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInUp,
} from "react-native-reanimated";
import { useEffect } from "react";
import { triggerSuccessHaptic } from "@/state/haptics";

interface ForceUpdateScreenProps {
  currentVersion: string;
  minVersion: string;
  onUpdate: () => void;
}

export function ForceUpdateScreen({
  currentVersion,
  minVersion,
  onUpdate,
}: ForceUpdateScreenProps) {
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Subtle pulsing animation on the icon
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleUpdate = () => {
    triggerSuccessHaptic();
    onUpdate();
  };

  const storeName = Platform.OS === "ios" ? "App Store" : "Play Store";

  return (
    <YStack flex={1} backgroundColor="$bg">
      <LinearGradient
        colors={["rgba(99, 102, 241, 0.15)", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <YStack
        flex={1}
        paddingTop={insets.top + 60}
        paddingBottom={insets.bottom + 40}
        paddingHorizontal="$6"
        justifyContent="space-between"
        alignItems="center"
      >
        {/* Top Section - Icon & Title */}
        <YStack alignItems="center" gap="$6" flex={1} justifyContent="center">
          {/* Animated Icon Container */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            style={pulseStyle}
          >
            <Stack
              width={120}
              height={120}
              borderRadius={60}
              backgroundColor="$primarySoft"
              alignItems="center"
              justifyContent="center"
              borderWidth={3}
              borderColor="$primary"
            >
              <Download size={56} color="$primary" strokeWidth={1.5} />
            </Stack>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInUp.delay(400).duration(600)}>
            <YStack alignItems="center" gap="$3">
              <Text
                fontFamily="$heading"
                fontSize={28}
                fontWeight="800"
                color="$color"
                textAlign="center"
              >
                Update Required
              </Text>
              <Text
                fontFamily="$body"
                fontSize={16}
                color="$colorMuted"
                textAlign="center"
                lineHeight={24}
                paddingHorizontal="$4"
              >
                A new version of Syngo is available with important updates.
                Please update to continue using the app.
              </Text>
            </YStack>
          </Animated.View>

          {/* Version Info Card */}
          <Animated.View entering={FadeInUp.delay(600).duration(600)}>
            <YStack
              backgroundColor="$bgCard"
              borderRadius="$6"
              padding="$4"
              width={280}
              gap="$3"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontFamily="$body" fontSize={14} color="$colorMuted">
                  Your Version
                </Text>
                <Text
                  fontFamily="$body"
                  fontSize={14}
                  fontWeight="600"
                  color="$color"
                >
                  v{currentVersion}
                </Text>
              </XStack>

              <Stack height={1} backgroundColor="$borderColor" />

              <XStack justifyContent="space-between" alignItems="center">
                <Text fontFamily="$body" fontSize={14} color="$colorMuted">
                  Required Version
                </Text>
                <XStack alignItems="center" gap="$2">
                  <Text
                    fontFamily="$body"
                    fontSize={14}
                    fontWeight="700"
                    color="$primary"
                  >
                    v{minVersion}+
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </Animated.View>
        </YStack>

        {/* Bottom Section - Button */}
        <Animated.View
          entering={FadeIn.delay(800).duration(600)}
          style={{ width: "100%" }}
        >
          <YStack gap="$4" width="100%">
            <Button
              backgroundColor="$primary"
              borderRadius="$8"
              height={56}
              onPress={handleUpdate}
              pressStyle={{ opacity: 0.9, scale: 0.98 }}
            >
              <XStack alignItems="center" gap="$3">
                <Smartphone size={20} color="white" />
                <Text
                  fontFamily="$body"
                  fontSize={16}
                  fontWeight="700"
                  color="white"
                >
                  Update on {storeName}
                </Text>
                <ArrowRight size={18} color="white" />
              </XStack>
            </Button>

            <Text
              fontFamily="$body"
              fontSize={12}
              color="$colorMuted"
              textAlign="center"
              opacity={0.7}
            >
              You'll be redirected to the {storeName}
            </Text>
          </YStack>
        </Animated.View>
      </YStack>
    </YStack>
  );
}
