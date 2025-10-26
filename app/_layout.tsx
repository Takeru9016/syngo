import { useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { TamaguiProvider, Theme, YStack, Text } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import config from '../tamagui.config';
import { usePairingStore } from '@/state/pairing';
import { useThemeStore } from '@/state/theme';
import { useAuthStore } from '@/store/auth';
import { initializeAuthListener } from '@/services/auth/auth.service';
import { testFirebaseConnection } from '@/utils/test/testFirebase';
import { testSecurityRules } from '@/utils/test/testSecurityRules';

const qc = new QueryClient();

function LoadingScreen() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$bg">
      <Text color="$color" fontSize={20} fontWeight="700">
        Loading...
      </Text>
    </YStack>
  );
}

function Gate() {
  const router = useRouter();
  const segments = useSegments();
  const { status } = usePairingStore();
  const { initialized } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !initialized) return;
    
    const inTabs = segments[0] === '(tabs)';

    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    if (status !== 'paired' && inTabs) {
      router.replace('/pair');
    }
  }, [mounted, initialized, segments, status]);

  // Show loading screen until auth is initialized
  if (!initialized) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { mode } = useThemeStore();

  const activeTheme = mode === 'system' 
    ? (systemScheme === 'dark' ? 'dark' : 'light')
    : mode;

  useEffect(() => {
    // Test Firebase connection
    testFirebaseConnection();
    testSecurityRules()
    
    // Initialize auth listener
    const unsubscribe = initializeAuthListener();
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={qc}>
      <TamaguiProvider config={config}>
        <Theme name={activeTheme}>
          <Gate />
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}