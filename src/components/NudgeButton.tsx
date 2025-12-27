import { useEffect, useRef } from "react";
import { Animated, Easing, Alert } from "react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Heart } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNudge } from "@/hooks/useNudge";
import { useToast } from "@/hooks/useToast";
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
  const { success, error: toastError } = useToast();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Particle animations (4 orbiting hearts)
  const particleAnims = useRef(
    Array.from({ length: 4 }, () => ({
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (canSendNudge) {
      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Glow animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      // Particle orbit animations
      const particleAnimations = particleAnims.map((anim, index) => {
        const delay = index * 750; // Stagger particles
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(anim.rotate, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(anim.opacity, {
                  toValue: 0.8,
                  duration: 400,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(anim.opacity, {
                  toValue: 0,
                  duration: 400,
                  delay: 2200,
                  easing: Easing.in(Easing.ease),
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(anim.scale, {
                  toValue: 1.2,
                  duration: 1500,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                  toValue: 0.8,
                  duration: 1500,
                  easing: Easing.inOut(Easing.ease),
                  useNativeDriver: true,
                }),
              ]),
            ]),
          ])
        );
      });

      pulseAnimation.start();
      glowAnimation.start();
      rotateAnimation.start();
      particleAnimations.forEach((anim) => anim.start());

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
        rotateAnimation.stop();
        particleAnimations.forEach((anim) => anim.stop());
      };
    } else {
      // Reset animations when disabled
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
      rotateAnim.setValue(0);
      particleAnims.forEach((anim) => {
        anim.rotate.setValue(0);
        anim.opacity.setValue(0);
        anim.scale.setValue(1);
      });
    }
  }, [canSendNudge]);

  const handlePress = () => {
    if (!hasPartner) {
      Alert.alert(
        "No Partner",
        "You need to pair with someone before sending nudges!",
        [{ text: "Got it", style: "default" }]
      );
      return;
    }

    if (!canSendNudge) {
      triggerLightHaptic();
      return;
    }

    triggerLightHaptic();
    sendNudge();

    // Show success feedback with toast
    setTimeout(() => {
      triggerSuccessHaptic();
      success("Nudge Sent!", "Your partner will feel the love");
    }, 300);
  };

  // Show error if any
  useEffect(() => {
    if (error) {
      toastError("Oops!", error.message);
    }
  }, [error]);

  if (!hasPartner) {
    return null;
  }

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Stack
      position="absolute"
      bottom={24}
      right={24}
      zIndex={1000}
      onPress={handlePress}
      pressStyle={{ scale: 0.92 }}
      cursor="pointer"
    >
      {/* Orbiting particles */}
      {canSendNudge &&
        particleAnims.map((anim, index) => {
          const angle = (index / particleAnims.length) * Math.PI * 2;
          const radius = 48;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const particleRotation = anim.rotate.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "360deg"],
          });

          return (
            <Animated.View
              key={index}
              style={{
                position: "absolute",
                top: 36,
                left: 36,
                opacity: anim.opacity,
                transform: [
                  { translateX: x },
                  { translateY: y },
                  { rotate: particleRotation },
                  { scale: anim.scale },
                ],
              }}
              pointerEvents="none"
            >
              <Heart size={14} color="#FF6987" fill="#FF6987" />
            </Animated.View>
          );
        })}

      {/* Multi-layer glow effect */}
      <Animated.View
        style={{
          position: "absolute",
          top: -12,
          left: -12,
          right: -12,
          bottom: -12,
          opacity: canSendNudge ? glowOpacity : 0,
        }}
        pointerEvents="none"
      >
        <Stack
          width="100%"
          height="100%"
          borderRadius={48}
          backgroundColor="rgba(255, 105, 135, 0.25)"
          style={{
            shadowColor: "#FF6987",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
          }}
        />
      </Animated.View>

      {/* Secondary glow */}
      <Animated.View
        style={{
          position: "absolute",
          top: -6,
          left: -6,
          right: -6,
          bottom: -6,
          opacity: canSendNudge ? glowOpacity : 0,
        }}
        pointerEvents="none"
      >
        <Stack
          width="100%"
          height="100%"
          borderRadius={42}
          backgroundColor="rgba(255, 105, 135, 0.35)"
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
          transform: [
            { scale: canSendNudge ? pulseAnim : 1 },
            { rotate: canSendNudge ? rotation : "0deg" },
          ],
        }}
      >
        <Stack
          width={72}
          height={72}
          borderRadius={36}
          overflow="hidden"
          alignItems="center"
          justifyContent="center"
          style={{
            shadowColor: canSendNudge ? "#FF6987" : "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          {/* Gradient background */}
          <LinearGradient
            colors={
              canSendNudge
                ? ["#FF6987", "#FF4D6D", "#C9184A"]
                : ["#9E9E9E", "#757575", "#616161"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Content */}
          {isLoading ? (
            <Animated.View
              style={{
                transform: [{ rotate: rotation }],
              }}
            >
              <Heart size={32} color="white" fill="white" opacity={0.8} />
            </Animated.View>
          ) : canSendNudge ? (
            <Heart size={32} color="white" fill="white" />
          ) : (
            <YStack alignItems="center" justifyContent="center" gap="$1">
              <Heart size={22} color="white" fill="white" opacity={0.7} />
              <Text
                fontFamily="$body"
                color="white"
                fontSize={9}
                fontWeight="700"
                opacity={0.9}
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
          bottom={80}
          right={0}
          backgroundColor="rgba(0, 0, 0, 0.85)"
          paddingHorizontal="$3.5"
          paddingVertical="$2.5"
          borderRadius="$5"
          minWidth={150}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <XStack alignItems="center" gap="$2" justifyContent="center">
            <Heart size={16} color="white" fill="white" />
            <Text
              fontFamily="$body"
              color="white"
              fontSize={13}
              fontWeight="600"
            >
              Send a nudge
            </Text>
          </XStack>
          {/* Arrow pointing down */}
          <Stack
            position="absolute"
            bottom={-6}
            right={24}
            width={12}
            height={12}
            backgroundColor="rgba(0, 0, 0, 0.85)"
            style={{
              transform: [{ rotate: "45deg" }],
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}
