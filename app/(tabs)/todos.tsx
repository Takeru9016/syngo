import { YStack, Text, Stack, Button, XStack, Separator } from 'tamagui';

export default function TodosScreen() {
  return (
    <YStack flex={1} backgroundColor="$bg" padding="$4" paddingTop="$6" gap="$4">
      <Text color="$color" fontSize={24} fontWeight="800">
        Todos
      </Text>

      <Stack backgroundColor="$bgCard" borderRadius="$6" padding="$4" gap="$3">
        <Text color="$muted">Your todos will appear here.</Text>
        <Separator />
        <XStack gap="$3">
          <Button backgroundColor="$primary">Add Todo</Button>
          <Button chromeless>Filters</Button>
        </XStack>
      </Stack>
    </YStack>
  );
}