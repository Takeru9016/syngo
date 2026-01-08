import { Alert, Animated } from "react-native";
import { YStack, Text, Stack, Button, Image } from "tamagui";
import { Send } from "@tamagui/lucide-icons";

import { Sticker } from "@/types";
import { useScaleIn, getStaggerDelay } from "@/utils/animations";

type Props = {
  sticker: Sticker;
  onSend: (sticker: Sticker) => void;
  onDelete?: (id: string) => void; // Optional for predefined stickers
  onLongPress?: (sticker: Sticker) => void; // Optional for predefined stickers
  onEdit?: (sticker: Sticker) => void; // Edit sticker
  index?: number;
  isPredefined?: boolean; // Flag to indicate predefined sticker
};

export function StickerCard({
  sticker,
  onSend,
  onDelete,
  onEdit,
  index = 0,
  isPredefined = false,
}: Props) {
  const { opacity, transform } = useScaleIn(getStaggerDelay(index, 40, 200));

  const handleLongPress = () => {
    // Don't allow delete for predefined stickers
    if (isPredefined || !onDelete) {
      Alert.alert(
        sticker.name,
        sticker.description || "Tap to send this sticker to your partner!",
        [
          {
            text: "Send",
            onPress: () => onSend(sticker),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
      return;
    }

    Alert.alert(
      sticker.name,
      sticker.description || "What would you like to do?",
      [
        {
          text: "Send to partner",
          onPress: () => onSend(sticker),
        },
        ...(onEdit
          ? [
              {
                text: "Edit",
                onPress: () => onEdit(sticker),
              },
            ]
          : []),
        {
          text: "Delete",
          style: "destructive" as const,
          onPress: () => {
            Alert.alert("Delete sticker", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => onDelete(sticker.id),
              },
            ]);
          },
        },
        {
          text: "Cancel",
          style: "cancel" as const,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Animated.View style={{ opacity, transform }}>
      <Button
        unstyled
        onPress={() => onSend(sticker)}
        onLongPress={handleLongPress}
        pressStyle={{ opacity: 0.9, scale: 0.97 }}
      >
        <YStack
          backgroundColor="$bgSoft"
          borderRadius="$7"
          overflow="hidden"
          padding="$2"
          gap="$2"
        >
          {/* Image area with overlay send icon */}
          <Stack
            width="100%"
            height={170}
            borderRadius="$6"
            overflow="hidden"
            backgroundColor="$bg"
          >
            <Image
              source={
                typeof sticker.imageUrl === "string"
                  ? { uri: sticker.imageUrl }
                  : sticker.imageUrl
              }
              width="100%"
              height="100%"
              objectFit="cover"
            />

            {/* Send hint icon */}
            <Stack
              position="absolute"
              top="$2"
              right="$2"
              height="$8"
              backgroundColor="rgba(0,0,0,0.55)"
              borderRadius="$8"
              paddingHorizontal="$2"
              paddingVertical="$2"
              alignItems="center"
              justifyContent="center"
            >
              <Send size={14} color="white" />
            </Stack>
          </Stack>

          {/* Name and Description */}
          <YStack gap="$1" padding="$2">
            <Text
              color="$color"
              fontSize={12}
              fontWeight="600"
              numberOfLines={1}
              textAlign="left"
            >
              {sticker.name}
            </Text>
            {sticker.description && (
              <Text
                color="$colorMuted"
                fontSize={11}
                numberOfLines={2}
                textAlign="left"
                lineHeight={14}
              >
                {sticker.description}
              </Text>
            )}
          </YStack>
        </YStack>
      </Button>
    </Animated.View>
  );
}
