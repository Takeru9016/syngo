import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { useThemeSync } from "@/theme/useThemeSync";
import { useAuthStore } from "@/store/auth";
import { updateUserProfile } from "@/services/profile/profile.service";
import { springs } from "@/lib/motion";
import { triggerSelectionHaptic } from "@/state/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingScreen() {
  useThemeSync();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleGetStarted = async () => {
    try {
      if (user?.uid) {
        await updateUserProfile(user.uid, {
          showOnboardingAfterUnpair: false,
        });
      }
      router.replace("/pair");
    } catch (err) {
      console.warn("⚠️ Failed to update onboarding flag:", err);
      router.replace("/pair");
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <Text style={styles.title}>Syngo</Text>
          <Text style={styles.subtitle}>
            A cozy little space for just the two of you.
          </Text>
        </View>

        <View style={styles.hero}>
          <Image
            source={require("../assets/illustrations/onboarding-3d-hero.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.heroCaption}>
            Tiny reminders, shared todos, and pinned moments that keep you
            gently in sync — without the noise of other apps.
          </Text>
        </View>

        <View style={[styles.bottom, { marginBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.pitch}>
            <Text style={styles.pitchTitle}>Stay close, even on busy days.</Text>
            <Text style={styles.pitchBody}>
              Set little nudges, track shared tasks, and save moments that
              matter — to both of you.
            </Text>
          </View>

          <AnimatedPressable
            style={[styles.cta, animatedStyle]}
            onPressIn={() => {
              scale.value = withSpring(0.97, springs.pressIn);
            }}
            onPressOut={() => {
              scale.value = withSpring(1, springs.pressOut);
            }}
            onPress={() => {
              triggerSelectionHaptic();
              handleGetStarted();
            }}
          >
            <Text style={styles.ctaLabel}>Get started together</Text>
          </AnimatedPressable>

          <Text style={styles.footnote}>
            You&apos;ll only see this when you&apos;re not paired.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    padding: theme.space.xl,
    justifyContent: "space-between",
  },
  brand: {
    gap: theme.space.sm,
  },
  title: {
    fontFamily: theme.typography.fontFamily.emotional,
    fontSize: 36,
    lineHeight: 44,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: theme.typography.size.md,
    color: theme.colors.textMuted,
  },
  hero: {
    alignItems: "center",
    paddingVertical: theme.space.lg,
    gap: theme.space.xs,
    flex: 1,
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    maxWidth: 500,
    aspectRatio: 1,
  },
  heroCaption: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 500,
  },
  bottom: {
    gap: theme.space.lg,
  },
  pitch: {
    gap: theme.space.sm,
  },
  pitchTitle: {
    fontFamily: theme.typography.fontFamily.emotional,
    fontSize: 24,
    lineHeight: 30,
    color: theme.colors.text,
    textAlign: "center",
  },
  pitchBody: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: theme.typography.size.md,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  cta: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.onPrimary,
    fontWeight: "600",
    fontSize: 17,
  },
  footnote: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: theme.space.xs,
  },
}));
