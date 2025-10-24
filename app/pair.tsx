import { YStack, XStack, Text, Button, Stack } from 'tamagui';
import { router } from 'expo-router';

export default function PairScreen() {
  return (
    <YStack flex={1} backgroundColor="$bg" padding="$4" paddingTop="$6" gap="$4">
      <XStack alignItems="center" justifyContent="space-between">
        <Text color="$color" fontSize={26} fontWeight="800">
          Pair with your partner
        </Text>
        <Button unstyled onPress={() => router.replace('/(tabs)')}>
          <Text color="$primary" textDecorationLine="underline">
            Next
          </Text>
        </Button>
      </XStack>

      <Text color="$muted">
        This screen will show the invite code and input fields in Phase 1.
      </Text>

      <Stack backgroundColor="$bgCard" borderRadius="$6" padding="$4">
        <Text color="$color">Invite Code Card (coming next)</Text>
      </Stack>

      <Stack backgroundColor="$bgCard" borderRadius="$6" padding="$4">
        <Text color="$color">Enter Code Card (coming next)</Text>
      </Stack>
    </YStack>
  );
}