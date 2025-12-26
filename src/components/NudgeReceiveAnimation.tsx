import { useEffect, useRef } from "react";
import { Animated, Easing, Dimensions } from "react-native";
import { Stack, Text, YStack, useTheme } from "tamagui";
import { Heart, Sparkles } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { triggerSuccessHaptic } from "@/state/haptics";

const { width, height } = Dimensions.get("window");

type NudgeReceiveAnimationProps = {
  senderName?: string;
  onComplete?: () => void;
};

type ParticleType = "heart" | "sparkle";

interface Particle {
  translateY: Animated.Value;
  translateX: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotate: Animated.Value;
  type: ParticleType;
  size: number;
}

export function NudgeReceiveAnimation({
  senderName = "Someone special",
  onComplete,
}: NudgeReceiveAnimationProps) {
  const theme = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const iconPulseAnim = useRef(new Animated.Value(1)).current;

  // Create 20 particles with mixed types
  const particles = useRef<Particle[]>(
    Array.from({ length: 20 }, (_, i) => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
      rotate: new Animated.Value(0),
      type: (i % 10 < 7 ? "heart" : "sparkle") as ParticleType,
      size: 20 + Math.random() * 12,
    }))
  ).current;

  useEffect(() => {
    // Trigger haptic feedback
    triggerSuccessHaptic();

    // Background fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Card entrance with spring
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Icon pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulseAnim, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Floating particles animation
    particles.forEach((particle, index) => {
      const delay = index * 100;
      const angle = (index / particles.length) * Math.PI * 2;
      const distance = 120 + Math.random() * 80;
      const duration = 2500 + Math.random() * 1000;

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(particle.translateY, {
            toValue: -distance - Math.random() * 120,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateX, {
            toValue: Math.cos(angle) * distance * (0.8 + Math.random() * 0.4),
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: duration * 0.8,
            delay: duration * 0.2,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1.4,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0.6,
              duration: duration - 400,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(particle.rotate, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);
    });

    // Auto-dismiss after 3.5 seconds
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
    }, 3500);

    return () => clearTimeout(dismissTimer);
  }, []);

  const shimmerX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const rotateInterpolate = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

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
      {/* Radial gradient background overlay */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: fadeAnim,
        }}
      >
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0.7)",
            "rgba(0, 0, 0, 0.4)",
            "rgba(0, 0, 0, 0.7)",
          ]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ width: "100%", height: "100%" }}
        />
      </Animated.View>

      {/* Floating particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: "absolute",
            top: height / 2,
            left: width / 2,
            transform: [
              { translateX: particle.translateX },
              { translateY: particle.translateY },
              { scale: particle.scale },
              { rotate: rotateInterpolate(particle.rotate) },
            ],
            opacity: particle.opacity,
          }}
        >
          {particle.type === "heart" ? (
            <Heart
              size={particle.size}
              color="#FF6987"
              fill="#FF6987"
              opacity={0.9}
            />
          ) : (
            <Sparkles
              size={particle.size}
              color="#FFD700"
              fill="#FFD700"
              opacity={0.8}
            />
          )}
        </Animated.View>
      ))}

      {/* Center message card */}
      <Animated.View
        style={{
          position: "absolute",
          top: height / 2 - 120,
          left: 24,
          right: 24,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Stack
          borderRadius={32}
          overflow="hidden"
          style={{
            shadowColor: "#FF6987",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 24,
            elevation: 16,
          }}
        >
          {/* Gradient background */}
          <LinearGradient
            colors={["#FF6987", "#FF4D6D", "#C9184A"]}
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

          {/* Shimmer effect */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: [{ translateX: shimmerX }],
            }}
            pointerEvents="none"
          >
            <LinearGradient
              colors={[
                "transparent",
                "rgba(255, 255, 255, 0.3)",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: 200, height: "100%" }}
            />
          </Animated.View>

          {/* Content */}
          <YStack padding="$6" alignItems="center" gap="$4">
            {/* Animated heart icon */}
            <Animated.View
              style={{
                transform: [{ scale: iconPulseAnim }],
              }}
            >
              <Stack
                backgroundColor="rgba(255, 255, 255, 0.2)"
                borderRadius={100}
                padding="$4"
                alignItems="center"
                justifyContent="center"
              >
                <Heart size={56} color="white" fill="white" />
              </Stack>
            </Animated.View>

            {/* Text content */}
            <YStack alignItems="center" gap="$2">
              <Text
                fontFamily="$heading"
                color="white"
                fontSize={28}
                fontWeight="700"
                textAlign="center"
                letterSpacing={-0.5}
              >
                Thinking of you
              </Text>

              {/* Decorative divider */}
              <Stack
                width={60}
                height={3}
                backgroundColor="white"
                opacity={0.4}
                borderRadius={10}
                marginVertical="$1"
              />

              <Text
                fontFamily="$body"
                color="rgba(255, 255, 255, 0.95)"
                fontSize={17}
                textAlign="center"
                lineHeight={24}
              >
                <Text fontWeight="700">{senderName}</Text> is thinking of you
                right now
              </Text>
            </YStack>

            {/* Footer badge */}
            <Stack
              backgroundColor="rgba(255, 255, 255, 0.15)"
              paddingHorizontal="$3"
              paddingVertical="$1.5"
              borderRadius={20}
              marginTop="$1"
            >
              <Text
                fontFamily="$body"
                color="white"
                fontSize={11}
                fontWeight="600"
                letterSpacing={1.2}
                opacity={0.8}
              >
                NUDGE • JUST NOW
              </Text>
            </Stack>
          </YStack>
        </Stack>
      </Animated.View>
    </Stack>
  );
}
