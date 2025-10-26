import { Alert } from "react-native";
import { YStack, Text, Stack, Button, Image } from "tamagui";

import { Sticker } from "@/types";

type Props = {
  sticker: Sticker;
  onSend: (sticker: Sticker) => void;
  onDelete: (id: string) => void;
  onLongPress: (sticker: Sticker) => void;
};

export function StickerCard({ sticker, onSend, onDelete, onLongPress }: Props) {
  const handleLongPress = () => {
    Alert.alert(
      sticker.name,
      "What would you like to do?",
      [
        {
          text: "Send to Partner",
          onPress: () => onSend(sticker),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Delete Sticker", "Are you sure?", [
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
      pressStyle={{ opacity: 0.8 }}
    >
      <YStack
        backgroundColor="$background"
        borderRadius="$6"
        overflow="hidden"
        alignItems="center"
        padding="$2"
        gap="$2"
      >
        {/* Image */}
        <Stack
          width="100%"
          aspectRatio={1}
          borderRadius="$5"
          overflow="hidden"
          backgroundColor="$bg"
        >
          <Image
            source={{ uri: sticker.imageUrl }}
            width="100%"
            height="100%"
            resizeMode="cover"
          />
        </Stack>

        {/* Name */}
        <Text
          color="$color"
          fontSize={13}
          fontWeight="600"
          numberOfLines={1}
          textAlign="center"
          width="100%"
        >
          {sticker.name}
        </Text>
      </YStack>
    </Button>
  );
}
