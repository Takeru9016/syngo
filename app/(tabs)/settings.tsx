import { YStack, Text, Stack, Switch, XStack } from 'tamagui';
import { useColorScheme } from 'react-native';

export default function SettingsScreen() {
  const scheme = useColorScheme();

  return (
    <YStack flex={1} backgroundColor="$bg" padding="$4" paddingTop="$6" gap="$4">
      <Text color="$color" fontSize={24} fontWeight="800">
        Settings
      </Text>

      <Stack backgroundColor="$bgCard" borderRadius="$6" padding="$4" gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Text color="$color">System theme</Text>
          <Text color="$muted">{scheme}</Text>
        </XStack>
        <XStack alignItems="center" justifyContent="space-between">
          <Text color="$color">Notifications</Text>
          <Switch defaultChecked />
        </XStack>
      </Stack>
    </YStack>
  );
}