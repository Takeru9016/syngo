import { Modal } from "react-native";
import { YStack, XStack, Text, Button, Stack } from "tamagui";
import {
  Sun,
  Moon,
  Settings,
  Sunrise,
  Flower2,
  Grape,
  Heart,
  Coffee,
  Waves,
  Sunset,
  Cloud,
  X,
  Check,
} from "@tamagui/lucide-icons";

import { ThemeMode, ColorScheme, useThemeStore } from "@/state/theme";
import { triggerLightHaptic, triggerSelectionHaptic } from "@/state/haptics";

// Icon component type for type safety
type IconComponent = typeof Sun;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ThemeSelectorModal({ visible, onClose }: Props) {
  const { mode, colorScheme, setMode, setColorScheme } = useThemeStore();

  const modeOptions: {
    mode: ThemeMode;
    label: string;
    Icon: IconComponent;
    description: string;
  }[] = [
    {
      mode: "light",
      label: "Light",
      Icon: Sun,
      description: "Always use light theme",
    },
    {
      mode: "dark",
      label: "Dark",
      Icon: Moon,
      description: "Always use dark theme",
    },
    {
      mode: "system",
      label: "System",
      Icon: Settings,
      description: "Follow system settings",
    },
  ];

  const colorOptions: {
    scheme: ColorScheme;
    label: string;
    Icon: IconComponent;
    description: string;
    previewColors: string[];
  }[] = [
    {
      scheme: "coral",
      label: "Coral Sand",
      Icon: Sunrise,
      description: "Bright & optimistic",
      previewColors: ["#FF7A7A", "#FFE0DD", "#F4E2D9"],
    },
    {
      scheme: "rose",
      label: "Rose Latte",
      Icon: Flower2,
      description: "Warm & romantic",
      previewColors: ["#E86A82", "#FBD3DD", "#F3E0E3"],
    },
    {
      scheme: "plum",
      label: "Plum Mist",
      Icon: Grape,
      description: "Modern & elegant",
      previewColors: ["#9A5FB5", "#E7D6F3", "#E5DEEF"],
    },
    {
      scheme: "lavender",
      label: "Lavender Dreams",
      Icon: Heart,
      description: "Soft & dreamy",
      previewColors: ["#9C86E0", "#E1D8F9", "#E7E2F3"],
    },
    {
      scheme: "mocha",
      label: "Mocha Haze",
      Icon: Coffee,
      description: "Warm & cozy",
      previewColors: ["#C87A4A", "#F8D5B8", "#E7D6C7"],
    },
    {
      scheme: "ocean",
      label: "Ocean Mist",
      Icon: Waves,
      description: "Fresh & calm",
      previewColors: ["#1F9A88", "#C3E9E2", "#D5E7E6"],
    },
    {
      scheme: "sunset",
      label: "Sunset Glow",
      Icon: Sunset,
      description: "Vibrant & warm",
      previewColors: ["#FF8A5C", "#FFD5C0", "#F9E0D3"],
    },
    {
      scheme: "sky",
      label: "Sky Breeze",
      Icon: Cloud,
      description: "Cool & clear",
      previewColors: ["#3B82F6", "#C7D9FF", "#F3F6FB"],
    },
  ];

  const handleModeSelect = (newMode: ThemeMode) => {
    triggerSelectionHaptic();
    setMode(newMode);
  };

  const handleColorSelect = (newScheme: ColorScheme) => {
    triggerSelectionHaptic();
    setColorScheme(newScheme);
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
          maxHeight="85%"
        >
          <YStack padding="$4" gap="$5">
            {/* Header */}
            <XStack alignItems="center" justifyContent="space-between">
              <Text
                color="$color"
                fontSize={24}
                fontWeight="900"
                fontFamily="$heading"
              >
                Theme Settings
              </Text>
              <Button
                unstyled
                onPress={() => {
                  triggerLightHaptic();
                  onClose();
                }}
              >
                <X size={24} color="$colorMuted" />
              </Button>
            </XStack>

            {/* Color Scheme Section */}
            <YStack gap="$3">
              <Text
                color="$color"
                fontSize={16}
                fontWeight="700"
                fontFamily="$body"
              >
                Color Scheme
              </Text>
              <YStack gap="$2">
                {colorOptions.map((option) => (
                  <Button
                    key={option.scheme}
                    unstyled
                    onPress={() => handleColorSelect(option.scheme)}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Stack
                      backgroundColor="$bgCard"
                      borderRadius="$6"
                      padding="$4"
                      borderWidth={2}
                      borderColor={
                        colorScheme === option.scheme
                          ? "$primary"
                          : "$borderColor"
                      }
                    >
                      <XStack gap="$3" alignItems="center">
                        <option.Icon size={28} color="$colorMuted" />
                        <YStack flex={1} gap="$1">
                          <Text
                            color="$color"
                            fontSize={16}
                            fontWeight="700"
                            fontFamily="$body"
                          >
                            {option.label}
                          </Text>
                          <Text
                            color="$colorMuted"
                            fontSize={13}
                            fontFamily="$body"
                          >
                            {option.description}
                          </Text>
                        </YStack>
                        {/* Color preview chips */}
                        <XStack gap="$1">
                          {option.previewColors.map((c, i) => (
                            <Stack
                              key={i}
                              width={20}
                              height={20}
                              borderRadius="$2"
                              backgroundColor={c}
                            />
                          ))}
                        </XStack>
                        {colorScheme === option.scheme && (
                          <Check size={20} color="$primary" />
                        )}
                      </XStack>
                    </Stack>
                  </Button>
                ))}
              </YStack>
            </YStack>

            {/* Mode Section */}
            <YStack gap="$3">
              <Text
                color="$color"
                fontSize={16}
                fontWeight="700"
                fontFamily="$body"
              >
                Brightness
              </Text>
              <YStack gap="$2">
                {modeOptions.map((option) => (
                  <Button
                    key={option.mode}
                    unstyled
                    onPress={() => handleModeSelect(option.mode)}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Stack
                      backgroundColor="$bgCard"
                      borderRadius="$6"
                      padding="$4"
                      borderWidth={2}
                      borderColor={
                        mode === option.mode ? "$primary" : "$borderColor"
                      }
                    >
                      <XStack gap="$3" alignItems="center">
                        <option.Icon size={28} color="$colorMuted" />
                        <YStack flex={1} gap="$1">
                          <Text
                            color="$color"
                            fontSize={16}
                            fontWeight="700"
                            fontFamily="$body"
                          >
                            {option.label}
                          </Text>
                          <Text
                            color="$colorMuted"
                            fontSize={13}
                            fontFamily="$body"
                          >
                            {option.description}
                          </Text>
                        </YStack>
                        {mode === option.mode && (
                          <Check size={20} color="$primary" />
                        )}
                      </XStack>
                    </Stack>
                  </Button>
                ))}
              </YStack>
            </YStack>
          </YStack>
        </Stack>
      </Stack>
    </Modal>
  );
}
