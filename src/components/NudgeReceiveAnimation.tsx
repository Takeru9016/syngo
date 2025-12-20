import { useEffect, useRef } from "react";
import { Animated, Easing, Dimensions } from "react-native";
import { Stack, Text, YStack } from "tamagui";
import { triggerSuccessHaptic } from "@/state/haptics";

const { width, height } = Dimensions.get("window");

type NudgeReceiveAnimationProps = {
  senderName?: string;
  onComplete?: () => void;
};

export function NudgeReceiveAnimation({
  senderName = "Someone special",
  onComplete,
}: NudgeReceiveAnimationProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const heartAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    // Trigger haptic feedback
    triggerSuccessHaptic();

    // Main card animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating hearts animation
    heartAnims.forEach((anim, index) => {
      const delay = index * 150;
      const angle = (index / heartAnims.length) * Math.PI * 2;
      const distance = 100 + Math.random() * 50;

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: -distance - Math.random() * 100,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: Math.cos(angle) * distance,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.scale, {
              toValue: 1.3,
              duration: 500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 0.8,
              duration: 1500,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, delay);
    });

    // Auto-dismiss after 3 seconds
    const dismissTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    }, 3000);

    return () => clearTimeout(dismissTimer);
  }, []);

  return (
    <Stack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={9999}
      pointerEvents="none"
    >
      {/* Floating hearts particles */}
      {heartAnims.map((anim, index) => (
        <Animated.View
          key={index}
          style={{
            position: "absolute",
            top: height / 2,
            left: width / 2,
            transform: [
              { translateX: anim.translateX },
              { translateY: anim.translateY },
              { scale: anim.scale },
            ],
            opacity: anim.opacity,
          }}
        >
          <Text fontSize={24 + Math.random() * 16}>
            {["💕", "💖", "💗", "💓", "💝"][Math.floor(Math.random() * 5)]}
          </Text>
        </Animated.View>
      ))}

      {/* Center message card */}
      <Animated.View
        style={{
          position: "absolute",
          top: height / 2 - 80,
          left: 40,
          right: 40,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Stack
          backgroundColor="rgba(255, 105, 135, 0.95)"
          borderRadius="$8"
          padding="$5"
          alignItems="center"
          gap="$3"
          style={{
            shadowColor: "#FF6987",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
          }}
        >
          <YStack alignItems="center" gap="$2">
            <Text fontSize={48}>💕</Text>
            <Text
              fontFamily="$heading"
              color="white"
              fontSize={24}
              fontWeight="700"
              textAlign="center"
            >
              Thinking of you
            </Text>
            <Text
              fontFamily="$body"
              color="rgba(255, 255, 255, 0.9)"
              fontSize={16}
              textAlign="center"
              lineHeight={22}
            >
              {senderName} is thinking of you right now
            </Text>
          </YStack>
        </Stack>
      </Animated.View>
    </Stack>
  );
}
