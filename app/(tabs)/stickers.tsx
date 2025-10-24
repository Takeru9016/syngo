import { YStack, Text, Stack, Button, XStack } from 'tamagui';

export default function StickersScreen() {
  return (
    <YStack flex={1} backgroundColor="$bg" padding="$4" paddingTop="$6" gap="$4">
      <Text color="$color" fontSize={24} fontWeight="800">
        Stickers
      </Text>

      <Stack backgroundColor="$bgCard" borderRadius="$6" padding="$4" gap="$3">
        <Text color="$muted">Sticker grid and add/edit flows will go here.</Text>
        <XStack gap="$3" marginTop="$2">
          <Button backgroundColor="$primary">Add Sticker</Button>
          <Button chromeless>Manage</Button>
        </XStack>
      </Stack>
    </YStack>
  );
}