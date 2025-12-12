/**
 * Animation utilities for Syngo app
 * Uses React Native's Animated API for smooth, performant animations
 */
import { useRef, useEffect } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

// ─────────────────────────────────────────────────────────────────────────────
// Animation Constants
// ─────────────────────────────────────────────────────────────────────────────

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: 300,
} as const;

export const ANIMATION_EASING = {
  smooth: Easing.bezier(0.4, 0, 0.2, 1),
  bouncy: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  easeOut: Easing.out(Easing.cubic),
  easeInOut: Easing.inOut(Easing.cubic),
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Animation Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fade in animation on mount
 */
export function useFadeIn(delay = 0, duration = ANIMATION_DURATION.normal) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: ANIMATION_EASING.smooth,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return { opacity };
}

/**
 * Scale and fade in animation on mount
 */
export function useScaleIn(
  delay = 0,
  duration = ANIMATION_DURATION.normal,
  fromScale = 0.95
) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(fromScale)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: ANIMATION_EASING.smooth,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return { opacity, transform: [{ scale }] };
}

/**
 * Slide in animation on mount
 */
export function useSlideIn(
  direction: "up" | "down" | "left" | "right" = "up",
  delay = 0,
  duration = ANIMATION_DURATION.normal
) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateValue = useRef(new Animated.Value(getInitialOffset(direction))).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: ANIMATION_EASING.smooth,
          useNativeDriver: true,
        }),
        Animated.spring(translateValue, {
          toValue: 0,
          friction: 10,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  const transform = direction === "up" || direction === "down"
    ? [{ translateY: translateValue }]
    : [{ translateX: translateValue }];

  return { opacity, transform };
}

function getInitialOffset(direction: "up" | "down" | "left" | "right"): number {
  switch (direction) {
    case "up":
      return 20;
    case "down":
      return -20;
    case "left":
      return 20;
    case "right":
      return -20;
  }
}

/**
 * Stagger delay calculator for list items
 */
export function getStaggerDelay(index: number, baseDelay = 50, maxDelay = 300) {
  return Math.min(index * baseDelay, maxDelay);
}

/**
 * Bounce animation (for toggles, checkboxes)
 */
export function useBounce() {
  const scale = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.85,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { scale, bounce, transform: [{ scale }] };
}

/**
 * Pulse animation (for attention-grabbing elements)
 */
export function usePulse(autoStart = false) {
  const scale = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = () => {
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 500,
          easing: ANIMATION_EASING.easeInOut,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          easing: ANIMATION_EASING.easeInOut,
          useNativeDriver: true,
        }),
      ])
    );
    animationRef.current.start();
  };

  const stopPulse = () => {
    animationRef.current?.stop();
    scale.setValue(1);
  };

  useEffect(() => {
    if (autoStart) {
      startPulse();
    }
    return () => stopPulse();
  }, []);

  return { scale, startPulse, stopPulse, transform: [{ scale }] };
}

/**
 * Create animated style helper
 */
export function createAnimatedStyle(
  animatedValues: Partial<{
    opacity: Animated.Value;
    transform: Array<{ [key: string]: Animated.Value }>;
  }>
): Animated.WithAnimatedObject<ViewStyle> {
  return animatedValues as Animated.WithAnimatedObject<ViewStyle>;
}
