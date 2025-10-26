import { Modal } from "react-native";
import { YStack, XStack, Text, Button, Stack } from "tamagui";

import { ThemeMode } from "@/state/theme";

type Props = {
  visible: boolean;
  currentMode: ThemeMode;
  onClose: () => void;
  onSelect: (mode: ThemeMode) => void;
};

export function ThemeSelectorModal({
  visible,
  currentMode,
  onClose,
  onSelect,
}: Props) {
  const options: {
    mode: ThemeMode;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      mode: "light",
      label: "Light",
      icon: "☀️",
      description: "Always use light theme",
    },
    {
      mode: "dark",
      label: "Dark",
      icon: "🌙",
      description: "Always use dark theme",
    },
    {
      mode: "system",
      label: "System",
      icon: "⚙️",
      description: "Follow system settings",
    },
  ];

  const handleSelect = (mode: ThemeMode) => {
    onSelect(mode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Stack
        flex={1}
        backgroundColor="rgba(0,0,0,0.5)"
        justifyContent="flex-end"
      >
        <Stack
          backgroundColor="$bg"
          borderTopLeftRadius="$8"
          borderTopRightRadius="$8"
          paddingBottom="$6"
        >
          <YStack padding="$4" gap="$4">
            {/* Header */}
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="$color" fontSize={22} fontWeight="900">
                Choose Theme
              </Text>
              <Button unstyled onPress={onClose}>
                <Text color="$muted" fontSize={28}>
                  ✕
                </Text>
              </Button>
            </XStack>

            {/* Options */}
            <YStack gap="$2">
              {options.map((option) => (
                <Button
                  key={option.mode}
                  unstyled
                  onPress={() => handleSelect(option.mode)}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Stack
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    borderWidth={2}
                    borderColor={
                      currentMode === option.mode ? "$primary" : "$borderColor"
                    }
                  >
                    <XStack gap="$3" alignItems="center">
                      <Text fontSize={32}>{option.icon}</Text>
                      <YStack flex={1} gap="$1">
                        <Text color="$color" fontSize={16} fontWeight="700">
                          {option.label}
                        </Text>
                        <Text color="$muted" fontSize={13}>
                          {option.description}
                        </Text>
                      </YStack>
                      {currentMode === option.mode && (
                        <Text fontSize={20}>✓</Text>
                      )}
                    </XStack>
                  </Stack>
                </Button>
              ))}
            </YStack>
          </YStack>
        </Stack>
      </Stack>
    </Modal>
  );
}
