import { useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import config from '../tamagui.config';
import { usePairingStore } from '@/state/pairing';

const qc = new QueryClient();

function Gate() {
  const router = useRouter();
  const segments = useSegments();
  const { status } = usePairingStore();

  const [mounted, setMounted] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const inTabs = segments[0] === '(tabs)';

    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    if (status !== 'paired' && inTabs) {
      router.replace('/pair');
    }
  }, [mounted, segments, status]);

  return <Slot />;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <QueryClientProvider client={qc}>
      <TamaguiProvider config={config}>
        <Theme name={scheme === 'dark' ? 'dark' : 'light'}>
          <Gate />
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}