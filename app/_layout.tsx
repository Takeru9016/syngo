// app/_layout.tsx
import { Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../tamagui.config';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient();

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <QueryClientProvider client={qc}>
      <TamaguiProvider config={config}>
        <Theme name={scheme === 'dark' ? 'dark' : 'light'}>
          <Stack screenOptions={{ headerShown: false }} />
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}