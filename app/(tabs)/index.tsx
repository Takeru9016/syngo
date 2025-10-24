import { YStack, Text, Stack, Button, XStack } from 'tamagui';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <YStack flex={1} backgroundColor="$bg" padding="$4" paddingTop="$6" gap="$4">
      <XStack alignItems="center" justifyContent="space-between">
        <Text color="$color" fontSize="$3" fontWeight="800" alignItems="center">
          Notify
        </Text>
        <Button
          size="$5"
          backgroundColor="$primary"
          onPress={() => router.push('/pair')}
        >
          Go to Pair
        </Button>
      </XStack>

      <Stack backgroundColor="$bgCard" borderRadius="$6" padding="$4">
        <Text color="$color">Welcome to the Tamagui + Expo Router scaffold.</Text>
        <Text color="$muted" marginTop="$2">
          We’ll render summaries, latest notification, and counts here later.
        </Text>
      </Stack>
    </YStack>
  );
}