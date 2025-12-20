import { useEffect, useRef } from "react";
import { Animated, Easing, Alert } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Heart } from "@tamagui/lucide-icons";
import { useNudge } from "@/hooks/useNudge";
import { triggerLightHaptic, triggerSuccessHaptic } from "@/state/haptics";

export function NudgeButton() {
  const {
    sendNudge,
    isLoading,
    canSendNudge,
    cooldownFormatted,
    hasPartner,
    error,
  } = useNudge();

  // Pulsing animation for the heart
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create pulsing heartbeat animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Create glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    if (canSendNudge) {
      pulseAnimation.start();
      glowAnimation.start();
    }

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, [canSendNudge, pulseAnim, glowAnim]);

  const handlePress = () => {
    if (!hasPartner) {
      Alert.alert(
        "No Partner",
        "You need to pair with someone before sending nudges! 💕"
      );
      return;
    }

    if (!canSendNudge) {
      triggerLightHaptic();
      return;
    }

    triggerLightHaptic();
    sendNudge();

    // Show success feedback
    setTimeout(() => {
      triggerSuccessHaptic();
      Alert.alert("💕 Nudge Sent!", "Your partner will feel the love", [
        { text: "Sweet!", style: "default" },
      ]);
    }, 300);
  };

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert("Oops!", error.message);
    }
  }, [error]);

  if (!hasPartner) {
    return null; // Don't show button if no partner
  }

  const opacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Stack
      position="absolute"
      bottom={24}
      right={24}
      zIndex={1000}
      onPress={handlePress}
      pressStyle={{ scale: 0.95 }}
      cursor="pointer"
    >
      {/* Glow effect */}
      <Animated.View
        style={{
          position: "absolute",
          top: -8,
          left: -8,
          right: -8,
          bottom: -8,
          opacity: canSendNudge ? opacity : 0,
        }}
      >
        <Stack
          width="100%"
          height="100%"
          borderRadius={40}
          backgroundColor="rgba(255, 105, 135, 0.3)"
          style={{
            shadowColor: "#FF6987",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
          }}
        />
      </Animated.View>

      {/* Main button */}
      <Animated.View
        style={{
          transform: [{ scale: canSendNudge ? pulseAnim : 1 }],
        }}
      >
        <Stack
          width={64}
          height={64}
          borderRadius={32}
          backgroundColor={canSendNudge ? "#FF6987" : "#A28A82"}
          alignItems="center"
          justifyContent="center"
          style={{
            shadowColor: canSendNudge ? "#FF6987" : "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          {isLoading ? (
            <YStack alignItems="center" justifyContent="center">
              <Text fontSize={20}>💕</Text>
            </YStack>
          ) : canSendNudge ? (
            <Heart size={28} color="white" fill="white" />
          ) : (
            <YStack alignItems="center" justifyContent="center" gap="$1">
              <Heart size={20} color="white" fill="white" opacity={0.6} />
              <Text
                fontFamily="$body"
                color="white"
                fontSize={9}
                fontWeight="700"
              >
                {cooldownFormatted}
              </Text>
            </YStack>
          )}
        </Stack>
      </Animated.View>

      {/* Tooltip when active */}
      {canSendNudge && (
        <Stack
          position="absolute"
          bottom={72}
          right={0}
          backgroundColor="rgba(0, 0, 0, 0.8)"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$4"
          minWidth={140}
        >
          <XStack alignItems="center" gap="$2">
            <Text
              fontFamily="$body"
              color="white"
              fontSize={12}
              fontWeight="600"
              textAlign="center"
            >
              💕 Send a nudge
            </Text>
          </XStack>
          {/* Arrow pointing down */}
          <Stack
            position="absolute"
            bottom={-6}
            right={20}
            width={12}
            height={12}
            backgroundColor="rgba(0, 0, 0, 0.8)"
            style={{
              transform: [{ rotate: "45deg" }],
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}
