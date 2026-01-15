import { useEffect } from "react";
import { YStack, Text } from "tamagui";
import { Heart } from "@tamagui/lucide-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

/**
 * A heartfelt loading screen with a pulsing heart animation.
 * Designed to feel connected and loving for a couples app.
 */
export function LoadingScreen() {
  // Heart pulse animation
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  // Secondary hearts for floating effect
  const heart1Y = useSharedValue(0);
  const heart1Opacity = useSharedValue(0);
  const heart2Y = useSharedValue(0);
  const heart2Opacity = useSharedValue(0);

  useEffect(() => {
    // Main heart pulse - mimics a heartbeat rhythm
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 200, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) }),
        withTiming(1.12, { duration: 180, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );

    // Subtle glow pulse
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.7, { duration: 600 }),
      ),
      -1,
      true,
    );

    // Floating heart 1 - rises and fades
    heart1Y.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(-60, { duration: 2000, easing: Easing.out(Easing.ease) }),
      ),
      -1,
      false,
    );
    heart1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 400 }),
        withTiming(0, { duration: 1600 }),
      ),
      -1,
      false,
    );

    // Floating heart 2 - delayed, rises and fades
    heart2Y.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-50, { duration: 1800, easing: Easing.out(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    heart2Opacity.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 300 }),
          withTiming(0, { duration: 1500 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const floating1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: heart1Y.value }, { translateX: -25 }],
    opacity: heart1Opacity.value,
  }));

  const floating2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: heart2Y.value }, { translateX: 25 }],
    opacity: heart2Opacity.value,
  }));

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$bg"
    >
      {/* Container for hearts */}
      <YStack position="relative" alignItems="center" justifyContent="center">
        {/* Floating mini hearts */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
            },
            floating1Style,
          ]}
        >
          <Heart size={16} color="$accent" fill="$accent" opacity={0.6} />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
            },
            floating2Style,
          ]}
        >
          <Heart size={14} color="$accent" fill="$accent" opacity={0.5} />
        </Animated.View>

        {/* Main pulsing heart */}
        <Animated.View style={heartStyle}>
          <Heart size={56} color="$accent" fill="$accent" />
        </Animated.View>
      </YStack>

      {/* Loving message */}
      <Text
        color="$colorSubtle"
        fontSize={15}
        fontFamily="$body"
        marginTop="$4"
        opacity={0.8}
      >
        Connecting hearts...
      </Text>
    </YStack>
  );
}
