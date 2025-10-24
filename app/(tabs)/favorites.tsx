import { YStack, Text, Stack } from 'tamagui';

export default function FavoritesScreen() {
  return (
    <YStack flex={1} backgroundColor="$bg" padding="$4" paddingTop="$6" gap="$4">
      <Text color="$color" fontSize={24} fontWeight="800">
        Favorites
      </Text>

      <Stack backgroundColor="$bgCard" borderRadius="$6" padding="$4">
        <Text color="$muted">Favorites list will be shown here.</Text>
      </Stack>
    </YStack>
  );
}