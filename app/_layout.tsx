import { useEffect, useRef, useState } from "react";
import { useColorScheme } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TamaguiProvider, Theme, YStack, Text, Stack } from "tamagui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font"; // ← Single import
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Sentry from "@sentry/react-native";

import config from "../tamagui.config";
import { usePairingStore } from "@/store/pairing";
import { useProfileStore } from "@/store/profile";
import { useThemeStore } from "@/state/theme";
import { useAuthStore } from "@/store/auth";
import { initializeAuthListener } from "@/services/auth/auth.service";
import {
  subscribeToProfile,
  subscribeToPartnerProfile,
} from "@/services/profile/profile.service";
import { testFirebaseConnection } from "@/utils/test/testFirebase";
import { NotificationService } from "@/services/notification/local-notification.service";
import { registerDevicePushToken } from "@/services/notification/push.registry";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import {
  InAppNotificationProvider,
  NudgeReceiveAnimation,
  UpdateModal,
  ForceUpdateScreen,
  LoadingScreen,
} from "@/components";
import { useForegroundNotification } from "@/hooks/useForegroundNotification";
import { useAppNotifications, useMarkAsRead } from "@/hooks/useAppNotification";
import { useNotificationStore } from "@/store/notification";
import { useAppUpdates } from "@/hooks/useAppUpdates";
import { useWidgetUpdates } from "@/hooks/useWidgetUpdates";

// Register Android widget headless task handler (must be at top level)
// This runs the background task when widgets need to render
import "@/widgets/widget-task-handler";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

const qc = new QueryClient();

function Gate() {
  const router = useRouter();
  const segments = useSegments();
  const { isPaired, setPairId } = usePairingStore();
  const { profile, setProfile, setPartnerProfile } = useProfileStore(); // ADD profile here
  const { initialized, user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [pairingChecked, setPairingChecked] = useState(false);
  const firstRun = useRef(true);

  // Nudge animation state
  const [showNudgeAnimation, setShowNudgeAnimation] = useState(false);
  const [nudgeSender, setNudgeSender] = useState("");
  const shownNudgeIds = useRef<Set<string>>(new Set()); // Track which nudges we've shown animation for
  const lastProcessedRef = useRef<number>(0); // Track last processed timestamp

  // Initialize notification listener (sets up Firestore subscription)
  useAppNotifications();

  // Get notifications directly from Zustand store (guaranteed to trigger re-renders)
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useMarkAsRead();

  // Enable in-app notification banner for foreground notifications
  useForegroundNotification();

  // Keep widgets updated with latest data
  useWidgetUpdates();

  // App update system (OTA + Store)
  const {
    storeUpdateRequired,
    showOtaModal,
    currentVersion,
    minSupportedVersion,
    applyOtaUpdate,
    dismissOtaModal,
    openStore,
    isDownloadingOta,
  } = useAppUpdates();

  // Listen for new nudge notifications and show animation globally
  useEffect(() => {
    // Don't process if already showing animation
    if (showNudgeAnimation) return;

    // Get all nudge notifications
    const allNudges = notifications.filter((n) => n.type === "nudge");

    // Find unread nudges we haven't shown animation for yet
    // Note: We removed the "recent nudge" fallback as it caused animations
    // to replay on app restart for nudges that were already read
    const eligibleNudge = allNudges.find((n) => {
      // Skip if we already showed animation for this nudge in this session
      if (shownNudgeIds.current.has(n.id)) return false;

      // Only show animation for unread nudges
      return !n.read;
    });

    if (!eligibleNudge) return;

    // Prevent rapid re-triggers (debounce by 500ms)
    const now = Date.now();
    if (now - lastProcessedRef.current < 500) return;
    lastProcessedRef.current = now;

    // Mark this nudge as shown
    shownNudgeIds.current.add(eligibleNudge.id);

    // Use senderName from data, or fallback to default
    const senderName =
      (eligibleNudge.data?.senderName as string) || "Your partner";

    setNudgeSender(senderName);
    setShowNudgeAnimation(true);

    // Mark as read after animation
    setTimeout(() => {
      markAsRead.mutate(eligibleNudge.id);
    }, 3500);
  }, [notifications]);

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Profile listener - sets up real-time profile updates
  useEffect(() => {
    if (!initialized || !user) return;

    const unsubscribe = subscribeToProfile((profile) => {
      setProfile(profile);

      // Update pairing store with pairId from profile
      if (profile?.pairId) {
        setPairId(profile.pairId);

        // Mark pairing as checked once we have profile data
        if (!pairingChecked) {
          setPairingChecked(true);
        }
      } else {
        setPairId(null);

        // Mark pairing as checked even if no pairId
        if (!pairingChecked) {
          setPairingChecked(true);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [initialized, user]);

  // Partner profile listener - sets up real-time partner updates
  useEffect(() => {
    if (!initialized || !user || !isPaired) return;

    const unsubscribe = subscribeToPartnerProfile((partnerProfile) => {
      setPartnerProfile(partnerProfile);
    });

    return () => {
      unsubscribe();
    };
  }, [initialized, user, isPaired]);

  // Router guard
  useEffect(() => {
    if (!mounted || !initialized || !pairingChecked) return;

    const inTabs = segments[0] === "(tabs)";
    const inPair = segments[0] === "pair";
    const inOnboarding = segments[0] === "onboarding";

    const isUnpaired = user && !isPaired;

    // Show onboarding if unpaired AND flag is true (or undefined, default to true)
    const shouldShowOnboarding =
      isUnpaired && profile?.showOnboardingAfterUnpair !== false;

    // Skip first run to prevent flash
    if (firstRun.current) {
      firstRun.current = false;

      // Initial navigation
      if (user && isPaired && !inTabs) {
        router.replace("/(tabs)");
        return;
      }

      if (shouldShowOnboarding && !inOnboarding) {
        router.replace("/onboarding");
        return;
      }

      if (isUnpaired && !shouldShowOnboarding && !inPair) {
        router.replace("/pair");
        return;
      }

      return;
    }

    // Subsequent navigation
    if (user && isPaired && (inPair || inOnboarding)) {
      router.replace("/(tabs)");
    } else if (shouldShowOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    } else if (isUnpaired && !shouldShowOnboarding && inTabs) {
      router.replace("/pair");
    }
  }, [
    mounted,
    initialized,
    pairingChecked,
    user,
    isPaired,
    profile?.showOnboardingAfterUnpair,
    segments,
  ]);

  // Show loading screen until auth and pairing status are checked
  if (!initialized || !pairingChecked) {
    return <LoadingScreen />;
  }

  // Block app usage if store update is required
  if (storeUpdateRequired) {
    return (
      <ForceUpdateScreen
        currentVersion={currentVersion}
        minVersion={minSupportedVersion}
        onUpdate={openStore}
      />
    );
  }

  return (
    <Stack flex={1}>
      <Slot />
      {/* Global Nudge Receive Animation - Must render AFTER Slot to be on top */}
      {showNudgeAnimation && (
        <NudgeReceiveAnimation
          senderName={nudgeSender}
          onComplete={() => setShowNudgeAnimation(false)}
        />
      )}
      {/* OTA Update Modal - Non-blocking prompt */}
      <UpdateModal
        visible={showOtaModal}
        onRestart={applyOtaUpdate}
        onDismiss={dismissOtaModal}
        isDownloading={isDownloadingOta}
      />
    </Stack>
  );
}

function RootLayout() {
  const systemScheme = useColorScheme();
  const { mode, colorScheme } = useThemeStore();

  // Load all fonts from local assets
  const [fontsLoaded] = useFonts({
    // Playfair Display weights
    "PlayfairDisplay-SemiBold": require("../assets/fonts/PlayfairDisplay-SemiBold.ttf"),
    "PlayfairDisplay-Bold": require("../assets/fonts/PlayfairDisplay-Bold.ttf"),
    "PlayfairDisplay-ExtraBold": require("../assets/fonts/PlayfairDisplay-ExtraBold.ttf"),
    "PlayfairDisplay-Black": require("../assets/fonts/PlayfairDisplay-Black.ttf"),

    // Inter weights
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Determine active theme name (properly typed)
  const effectiveMode =
    mode === "system" ?
      systemScheme === "dark" ?
        "dark"
      : "light"
    : mode;
  const activeTheme = `${colorScheme}_${effectiveMode}` as const;

  useEffect(() => {
    // Test Firebase connection (only in dev)
    if (__DEV__) {
      testFirebaseConnection();
      // testSecurityRules(); // Uncomment to test security rules
    }

    (async () => {
      try {
        await NotificationService.init();
      } catch (e) {
        console.warn("⚠️ Notification init failed:", e);
      }
    })();

    (async () => {
      try {
        const token = await registerDevicePushToken();
      } catch (e) {
        console.warn("⚠️ Push token registration failed:", e);
      }
    })();

    // Initialize auth listener
    const unsubscribe = initializeAuthListener();

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  if (!fontsLoaded) {
    return null; // Splash screen is still visible
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={qc}>
        <TamaguiProvider config={config}>
          <Theme name={activeTheme}>
            <StatusBar
              style={effectiveMode === "dark" ? "light" : "dark"}
              animated
            />
            <ErrorBoundary>
              <InAppNotificationProvider>
                <Gate />
              </InAppNotificationProvider>
            </ErrorBoundary>
          </Theme>
        </TamaguiProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
