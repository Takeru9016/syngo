import { useEffect, useRef, useState } from "react";
import { StatusBar, useColorScheme } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { TamaguiProvider, Theme, YStack, Text } from "tamagui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font"; // ← Single import
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync();

const qc = new QueryClient();

function LoadingScreen() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$bg"
    >
      <Text color="$color" fontSize={20} fontWeight="700">
        Loading...
      </Text>
    </YStack>
  );
}

function Gate() {
  const router = useRouter();
  const segments = useSegments();
  const { isPaired, setPairId } = usePairingStore();
  const { setProfile, setPartnerProfile } = useProfileStore();
  const { initialized, user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [pairingChecked, setPairingChecked] = useState(false);
  const firstRun = useRef(true);

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Profile listener - sets up real-time profile updates
  useEffect(() => {
    if (!initialized || !user) return;

    console.log("👂 Setting up profile listener");

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
      console.log("🔇 Cleaning up profile listener");
      unsubscribe();
    };
  }, [initialized, user]);

  // Partner profile listener - sets up real-time partner updates
  useEffect(() => {
    if (!initialized || !user || !isPaired) return;

    console.log("👂 Setting up partner profile listener");

    const unsubscribe = subscribeToPartnerProfile((partnerProfile) => {
      setPartnerProfile(partnerProfile);
    });

    return () => {
      console.log("🔇 Cleaning up partner profile listener");
      unsubscribe();
    };
  }, [initialized, user, isPaired]);

  // Router guard
  useEffect(() => {
    if (!mounted || !initialized || !pairingChecked) return;

    const inTabs = segments[0] === "(tabs)";
    const inPair = segments[0] === "pair";

    // Skip first run to prevent flash
    if (firstRun.current) {
      firstRun.current = false;

      // Initial navigation
      if (user && !isPaired && !inPair) {
        console.log("🔀 Redirecting to pair screen (not paired)");
        router.replace("/pair");
      } else if (user && isPaired && !inTabs) {
        console.log("🔀 Redirecting to tabs (paired)");
        router.replace("/(tabs)");
      }

      return;
    }

    // Subsequent navigation
    if (user && !isPaired && inTabs) {
      // User is authenticated but not paired, and trying to access tabs
      console.log(
        "🔀 Redirecting to pair screen (unpaired, tried to access tabs)"
      );
      router.replace("/pair");
    } else if (user && isPaired && inPair) {
      // User is paired but still on pair screen
      console.log("🔀 Redirecting to tabs (paired, on pair screen)");
      router.replace("/(tabs)");
    }
  }, [mounted, initialized, pairingChecked, user, isPaired, segments]);

  // Show loading screen until auth and pairing status are checked
  if (!initialized || !pairingChecked) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
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
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
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
        console.log("🔔 Notifications initialized");
      } catch (e) {
        console.warn("⚠️ Notification init failed:", e);
      }
    })();

    (async () => {
      try {
        const token = await registerDevicePushToken();
        if (token) console.log("🔑 Push token:", token);
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
              barStyle={
                effectiveMode === "dark" ? "light-content" : "dark-content"
              }
            />
            <ErrorBoundary>
              <Gate />
            </ErrorBoundary>
          </Theme>
        </TamaguiProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
