import { useState, useEffect, useMemo, type ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, Share, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { useThemeSync } from "@/theme/useThemeSync";
import { CodeInput, Countdown, usePairingStore } from "@/features/pairing";
import { formatCode, unformatCode } from "@/utils/code-generator";
import { subscribeToProfile } from "@/services/profile/profile.service";
import { triggerSelectionHaptic } from "@/state/haptics";
import { useToast } from "@/hooks/useToast";
import { springs } from "@/lib/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressScaleButton({
  children,
  style,
  disabled,
  onPress,
}: {
  children: ReactNode;
  style: object;
  disabled?: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle, disabled && styles.disabled]}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, springs.pressIn);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.pressOut);
      }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function PairScreen() {
  useThemeSync();
  const insets = useSafeAreaInsets();
  const {
    isPaired,
    pairId,
    code: myCode,
    expiresAt,
    isLoading,
    error,
    generateCode,
    redeemCode,
    checkExistingCode,
    setPairId,
    clearError,
  } = usePairingStore();
  const { success, error: toastError } = useToast();

  const [input, setInput] = useState<string>("");

  useEffect(() => {
    const unsubscribe = subscribeToProfile((profile) => {
      setPairId(profile?.pairId ?? null);
    });
    return () => unsubscribe();
  }, [setPairId]);

  useEffect(() => {
    if (!myCode || !expiresAt) {
      checkExistingCode().then((hasCode) => {
        if (!hasCode) {
          handleGenerate();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPaired && pairId) {
      router.replace("/(tabs)");
    }
  }, [isPaired, pairId]);

  const handleInputChange = (newValue: string) => {
    setInput(newValue);
    if (error) {
      clearError();
    }
  };

  const handleGenerate = async () => {
    triggerSelectionHaptic();
    await generateCode();
  };

  const handleCopy = async () => {
    if (myCode) {
      triggerSelectionHaptic();
      await Clipboard.setStringAsync(unformatCode(myCode));
      success("Copied!", "Code copied to clipboard");
    }
  };

  const handleShare = async () => {
    if (!myCode) return;
    try {
      triggerSelectionHaptic();
      await Share.share({
        message: `Join me on Syngo! Use this code to pair: ${myCode}`,
      });
    } catch (err) {
      console.error("Error sharing code:", err);
    }
  };

  // Ticks while a code is outstanding so `codeExpired` flips the moment the
  // code dies — Countdown's own interval is internal and doesn't re-render
  // this screen.
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const codeExpired = useMemo(() => {
    return !!expiresAt && now > expiresAt;
  }, [expiresAt, now]);

  const handleRedeem = async () => {
    const cleanInput = input.replace(/[^A-Z0-9]/gi, "");

    if (!cleanInput || cleanInput.length !== 6) {
      toastError("Invalid Code", "Please enter a valid 6-character code.");
      return;
    }

    const formattedCode = unformatCode(input);
    triggerSelectionHaptic();
    await redeemCode(formattedCode);
  };

  const displayCode = myCode ? formatCode(unformatCode(myCode)) : "---·---";

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 120 : 80}
        extraHeight={120}
        style={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pair with your partner</Text>
        </View>
        <Text style={styles.subtitle}>
          Pair and start sending cute reminders, stickers, and notes.
        </Text>

        <View style={styles.shareCard}>
          <Text style={styles.cardTitle}>I want to invite my partner</Text>

          <View style={styles.codeRow}>
            {isLoading && !myCode ? (
              <ActivityIndicator size="large" color={styles.primaryColor.color} />
            ) : (
              <Text style={styles.codeDisplay}>{displayCode}</Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            <PressScaleButton
              style={styles.primaryButton}
              disabled={isLoading || codeExpired || !myCode}
              onPress={handleCopy}
            >
              {isLoading ? (
                <ActivityIndicator color={styles.onPrimaryColor.color} />
              ) : (
                <Text style={styles.primaryButtonLabel}>Copy</Text>
              )}
            </PressScaleButton>
            <PressScaleButton
              style={styles.outlineButton}
              disabled={isLoading || codeExpired || !myCode}
              onPress={handleShare}
            >
              <Text style={styles.outlineButtonLabel}>Share</Text>
            </PressScaleButton>
          </View>

          <View style={styles.countdownRow}>
            <Countdown expiresAt={expiresAt} />
            <PressScaleButton
              style={styles.regenerateButton}
              disabled={isLoading}
              onPress={handleGenerate}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={styles.primaryColor.color} />
              ) : (
                <Text style={styles.regenerateLabel}>Regenerate</Text>
              )}
            </PressScaleButton>
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerBadge}>
            <Text style={styles.dividerLabel}>or</Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.redeemCard}>
          <Text style={styles.cardTitle}>I have a code</Text>
          <Text style={styles.subtitle}>Enter your partner&apos;s code</Text>

          <View style={styles.codeInputWrap}>
            <CodeInput length={6} group={3} value={input} onChange={handleInputChange} error={error} />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <PressScaleButton
            style={styles.primaryButton}
            disabled={isLoading || input.replace(/[^A-Z0-9]/gi, "").length < 6}
            onPress={handleRedeem}
          >
            {isLoading ? (
              <ActivityIndicator color={styles.onPrimaryColor.color} />
            ) : (
              <Text style={styles.primaryButtonLabel}>Pair now</Text>
            )}
          </PressScaleButton>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.space.xl,
    paddingTop: theme.space.sm,
    gap: theme.space.lg,
  },
  header: {
    marginTop: theme.space.lg,
    marginBottom: theme.space.sm,
  },
  title: {
    fontFamily: theme.typography.fontFamily.emotional,
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.md,
    lineHeight: 22,
    marginBottom: theme.space.sm,
  },
  shareCard: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.lg,
    padding: theme.space.xl,
    gap: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.emotional,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
  codeRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.space.md,
  },
  codeDisplay: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.space.md,
  },
  primaryColor: {
    color: theme.colors.primary,
  },
  onPrimaryColor: {
    color: theme.colors.onPrimary,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.onPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  outlineButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  countdownRow: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.md,
  },
  regenerateButton: {
    borderRadius: theme.radius.md,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    height: 44,
    paddingHorizontal: theme.space.md,
    alignItems: "center",
    justifyContent: "center",
  },
  regenerateLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: theme.space.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: theme.space.md,
  },
  dividerLabel: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  redeemCard: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.lg,
    padding: theme.space.xl,
    gap: theme.space.lg,
    marginBottom: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  codeInputWrap: {
    alignItems: "center",
  },
  errorBox: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.sm,
    padding: theme.space.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
}));
