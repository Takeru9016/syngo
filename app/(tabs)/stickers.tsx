import { useState, useMemo } from "react";
import {
  RefreshControl,
  FlatList,
  Alert,
  ListRenderItem,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { YStack, XStack, Text, Button, Stack, Spinner } from "tamagui";
import { ImagePlus, Sparkles } from "@tamagui/lucide-icons";

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
    // Alert logic is inside StickerCard
  };

  const handleSave = async (name: string, imageUrl: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createSticker.mutate({ name, imageUrl });
  };

  const totalCount = stickers.length;

  const sortedStickers = useMemo(
    () => [...stickers], // placeholder for future sort (e.g., by createdAt)
    [stickers]
  );

  const renderItem: ListRenderItem<Sticker> = ({ item, index }) => (
    <Stack
      flex={1}
      // slight offset every other row to look less rigid if you want:
      // marginTop={index % 2 === 0 ? 0 : 4}
    >
      <StickerCard
        sticker={item}
        onSend={handleSend}
        onDelete={handleDelete}
        onLongPress={handleLongPress}
      />
    </Stack>
  );

  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 4 : 2;

  return (
    <ScreenContainer scroll={false}>
      {/* Hero header */}
      <YStack paddingTop="$4" paddingBottom="$3" gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <YStack gap="$1" maxWidth="70%">
            <Text
              color="$color"
              fontSize={22}
              fontFamily="$heading"
              fontWeight="800"
            >
              Sticker gallery
            </Text>
            <Text color="$muted" fontSize={13}>
              A shared board of tiny reactions only you two understand.
            </Text>
          </YStack>

          <Button
            backgroundColor="$primary"
            borderRadius="$8"
            width={46}
            height={46}
            padding={0}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setModalVisible(true);
            }}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
          >
            <ImagePlus size={22} color="white" />
          </Button>
        </XStack>

        {/* Summary pill */}
        <XStack alignItems="center" justifyContent="flex-start">
          <XStack
            alignItems="center"
            gap="$2"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$8"
            backgroundColor="$bgSoft"
          >
            <Sparkles size={16} color="$primary" />
            <Text color="$muted" fontSize={12}>
              {totalCount} sticker{totalCount === 1 ? "" : "s"} in your gallery
            </Text>
          </XStack>
        </XStack>
      </YStack>

      {/* Loading State */}
      {isLoading ? (
        <YStack paddingTop="$3" gap="$3">
          <XStack gap="$3">
            {[1, 2].map((i) => (
              <Stack
                key={i}
                flex={1}
                height={170}
                borderRadius="$7"
                backgroundColor="$bgSoft"
                alignItems="center"
                justifyContent="center"
              >
                <Spinner size="small" color="$muted" />
              </Stack>
            ))}
          </XStack>
          <XStack gap="$3">
            {[3, 4].map((i) => (
              <Stack
                key={i}
                flex={1}
                height={170}
                borderRadius="$7"
                backgroundColor="$bgSoft"
                alignItems="center"
                justifyContent="center"
              >
                <Spinner size="small" color="$muted" />
              </Stack>
            ))}
          </XStack>
        </YStack>
      ) : sortedStickers.length === 0 ? (
        /* Empty State */
        <Stack
          flex={1}
          alignItems="center"
          justifyContent="center"
          paddingVertical="$8"
          gap="$4"
        >
          <Stack
            width={110}
            height={110}
            borderRadius="$8"
            backgroundColor="$bgSoft"
            alignItems="center"
            justifyContent="center"
          >
            <Sparkles size={40} color="$primary" />
          </Stack>

          <YStack gap="$2" alignItems="center" paddingHorizontal="$6">
            <Text
              color="$color"
              fontSize={18}
              fontWeight="700"
              fontFamily="$heading"
              textAlign="center"
            >
              No stickers yet
            </Text>
            <Text
              color="$muted"
              fontSize={14}
              textAlign="center"
              maxWidth={280}
            >
              Turn your inside jokes and favorite moments into little stickers
              you can send in a tap.
            </Text>
          </YStack>

          <Button
            backgroundColor="$primary"
            borderRadius="$7"
            height={46}
            paddingHorizontal="$6"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setModalVisible(true);
            }}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
          >
            <XStack alignItems="center" gap="$2">
              <ImagePlus size={18} color="white" />
              <Text color="white" fontWeight="700" fontSize={15}>
                Create your first sticker
              </Text>
            </XStack>
          </Button>
        </Stack>
      ) : (
        /* Gallery grid */
        <FlatList
          key={numColumns}
          data={sortedStickers}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={{
            paddingBottom: 24,
          }}
          columnWrapperStyle={{ gap: 16, paddingHorizontal: 4 }}
          ItemSeparatorComponent={() => <Stack height={16} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
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
