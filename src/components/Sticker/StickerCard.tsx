import { Alert } from "react-native";
import { YStack, Text, Stack, Button, Image } from "tamagui";
import { Send } from "@tamagui/lucide-icons";

import { Sticker } from "@/types";

type Props = {
  sticker: Sticker;
  onSend: (sticker: Sticker) => void;
  onDelete: (id: string) => void;
  onLongPress: (sticker: Sticker) => void;
};

export function StickerCard({ sticker, onSend, onDelete }: Props) {
  const handleLongPress = () => {
    Alert.alert(
      sticker.name,
      "What would you like to do?",
      [
        {
          text: "Send to partner",
          onPress: () => onSend(sticker),
        },
        {
          text: "Delete",
          style: "destructive",
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
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  return (
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
            source={{ uri: sticker.imageUrl }}
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

        {/* Name */}
        <Text
          color="$color"
          fontSize={12}
          fontWeight="600"
          numberOfLines={1}
          textAlign="left"
        >
          {sticker.name}
        </Text>
      </YStack>
    </Button>
  );
}
