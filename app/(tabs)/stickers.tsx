import { useEffect, useState } from "react";
import { RefreshControl, Dimensions, Alert } from "react-native";
import { YStack, XStack, Text, Button, ScrollView, Stack } from "tamagui";

import { Sticker } from "@/types";
import { StickerCard, AddStickerModal } from "@/components";
import {
  getStickers,
  addSticker,
  sendSticker,
  deleteSticker,
} from "@/services/stickers.mock";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 56) / 3; // 3 columns with padding

export default function StickersScreen() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await getStickers();
    setStickers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleAdd = () => {
    setModalVisible(true);
  };

  const handleSave = async (name: string, imageUrl: string) => {
    await addSticker({
      name,
      imageUrl,
      createdBy: "user1",
    });
    await load();
  };

  const handleSend = async (sticker: Sticker) => {
    Alert.alert(
      "Send Sticker",
      `Send "${sticker.name}" to your partner?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            await sendSticker(sticker.id);
            Alert.alert("Sent! 💌", `${sticker.name} was sent to your partner`);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async (id: string) => {
    await deleteSticker(id);
    await load();
  };

  const handleLongPress = (sticker: Sticker) => {
    // Handled in StickerCard component
  };

  return (
    <YStack flex={1} backgroundColor="$bg">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack flex={1} padding="$4" paddingTop="$6" gap="$4">
          {/* Header */}
          <XStack alignItems="center" justifyContent="space-between">
            <Text color="$color" fontSize={28} fontWeight="900">
              Stickers
            </Text>
            <Button
              backgroundColor="$primary"
              borderRadius="$6"
              height={40}
              paddingHorizontal="$4"
              onPress={handleAdd}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white" fontWeight="700" fontSize={15}>
                + Add
              </Text>
            </Button>
          </XStack>

          {/* Info */}
          <Stack backgroundColor="$background" borderRadius="$6" padding="$3">
            <Text color="$muted" fontSize={14} textAlign="center">
              Tap a sticker to send it to your partner 💌
            </Text>
          </Stack>

          {/* Grid */}
          {stickers.length === 0 ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$3"
            >
              <Text fontSize={60}>🎨</Text>
              <Text color="$muted" fontSize={16} textAlign="center">
                No stickers yet.{"\n"}Tap + Add to create your first sticker!
              </Text>
            </YStack>
          ) : (
            <XStack flexWrap="wrap" gap="$2">
              {stickers.map((sticker) => (
                <Stack key={sticker.id} width={CARD_WIDTH}>
                  <StickerCard
                    sticker={sticker}
                    onSend={handleSend}
                    onDelete={handleDelete}
                    onLongPress={handleLongPress}
                  />
                </Stack>
              ))}
            </XStack>
          )}

          {/* Instructions */}
          {stickers.length > 0 && (
            <Stack
              backgroundColor="$background"
              borderRadius="$6"
              padding="$3"
              marginTop="$2"
            >
              <Text color="$muted" fontSize={13} textAlign="center">
                💡 Long press a sticker for more options
              </Text>
            </Stack>
          )}
        </YStack>
      </ScrollView>

      {/* Add Modal */}
      <AddStickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </YStack>
  );
}
