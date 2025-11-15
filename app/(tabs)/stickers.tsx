import { useState } from "react";
import { RefreshControl, FlatList, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { YStack, XStack, Text, Button, Stack, Spinner } from "tamagui";

import {
  useStickers,
  useCreateSticker,
  useDeleteSticker,
} from "@/hooks/useStickers";
import { StickerCard, AddStickerModal, ScreenContainer } from "@/components";
import { Sticker } from "@/types";
import { AppNotificationService } from "@/services/notification/notification.service";

export default function StickersScreen() {
  const { data: stickers = [], isLoading, refetch } = useStickers();
  const createSticker = useCreateSticker();
  const deleteSticker = useDeleteSticker();

  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

  const handleSend = async (sticker: Sticker) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await AppNotificationService.sendToPartner({
        type: "sticker_sent",
        title: "Sticker from your partner",
        body: `${sticker.name} 🎨`,
        data: { stickerId: sticker.id, stickerUrl: sticker.imageUrl },
      });
      Alert.alert("Sent!", `${sticker.name} sent to your partner`);
    } catch (error) {
      console.error("Failed to send sticker:", error);
      Alert.alert("Error", "Failed to send sticker");
    }
  };

  const handleDelete = async (id: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteSticker.mutate(id);
  };

  const handleLongPress = (sticker: Sticker) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSave = async (name: string, imageUrl: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createSticker.mutate({ name, imageUrl });
  };

  return (
    <ScreenContainer title="Stickers">
      {/* Header */}
      <YStack padding="$4" paddingTop="$6" gap="$4">
        <XStack alignItems="center" justifyContent="space-between">
          <Text color="$color" fontSize={28} fontWeight="900">
            Create/Share
          </Text>
          <Button
            backgroundColor="$primary"
            borderRadius="$7"
            width={44}
            height={44}
            padding={0}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setModalVisible(true);
            }}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="white" fontSize={24} fontWeight="300">
              +
            </Text>
          </Button>
        </XStack>
      </YStack>

      {/* Loading State */}
      {isLoading ? (
        <YStack padding="$4" gap="$2">
          {[1, 2, 3, 4].map((i) => (
            <Stack
              key={i}
              backgroundColor="$background"
              borderRadius="$6"
              height={120}
            >
              <Spinner size="small" />
            </Stack>
          ))}
        </YStack>
      ) : stickers.length === 0 ? (
        /* Empty State */
        <Stack
          flex={1}
          alignItems="center"
          justifyContent="center"
          paddingVertical="$10"
          gap="$4"
        >
          <Text fontSize={64}>🎨</Text>
          <YStack gap="$2" alignItems="center">
            <Text color="$color" fontSize={20} fontWeight="700">
              No stickers yet
            </Text>
            <Text
              color="$muted"
              fontSize={15}
              textAlign="center"
              maxWidth={280}
            >
              Create custom stickers to send to your partner
            </Text>
          </YStack>
          <Button
            backgroundColor="$primary"
            borderRadius="$6"
            height={48}
            paddingHorizontal="$6"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setModalVisible(true);
            }}
            pressStyle={{ opacity: 0.8 }}
            marginTop="$2"
          >
            <Text color="white" fontWeight="700" fontSize={16}>
              Create Sticker
            </Text>
          </Button>
        </Stack>
      ) : (
        /* Stickers Grid */
        <FlatList
          data={stickers}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <Stack height={12} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <Stack flex={1}>
              <StickerCard
                sticker={item}
                onSend={handleSend}
                onDelete={handleDelete}
                onLongPress={handleLongPress}
              />
            </Stack>
          )}
        />
      )}

      {/* Add Sticker Modal */}
      <AddStickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </ScreenContainer>
  );
}
