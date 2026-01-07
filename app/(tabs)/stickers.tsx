import { useState, useMemo } from "react";
import {
  RefreshControl,
  FlatList,
  Alert,
  ListRenderItem,
  useWindowDimensions,
} from "react-native";
import { YStack, XStack, Text, Button, Stack, Spinner, Tabs } from "tamagui";
import { ImagePlus, Sparkles, Heart } from "@tamagui/lucide-icons";

import {
  useStickers,
  useCreateSticker,
  useUpdateSticker,
  useDeleteSticker,
} from "@/hooks/useStickers";
import { usePredefinedStickers } from "@/hooks/usePredefinedStickers";
import { StickerCard, AddStickerModal, ScreenContainer } from "@/components";
import { Sticker } from "@/types";
import { AppNotificationService } from "@/services/notification/notification.service";
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
} from "@/state/haptics";
import { useToast } from "@/hooks/useToast";

export default function StickersScreen() {
  const { data: stickers = [], isLoading, refetch } = useStickers();
  const { data: predefinedStickers = [], isLoading: predefinedLoading } =
    usePredefinedStickers();
  const createSticker = useCreateSticker();
  const updateSticker = useUpdateSticker();
  const deleteSticker = useDeleteSticker();

  const { success, error: toastError } = useToast();
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"custom" | "predefined">("custom");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    triggerLightHaptic();
    await refetch();
    setRefreshing(false);
  };

  const handleSend = async (sticker: Sticker) => {
    triggerSuccessHaptic();

    try {
      await AppNotificationService.sendToPartner({
        type: "sticker_sent",
        title: "Sticker from your partner",
        body: sticker.name,
        data: { stickerId: sticker.id, imageUrl: sticker.imageUrl },
      });
      success("Sticker Sent!", `${sticker.name} sent to your partner`);
    } catch (err) {
      console.error("Failed to send sticker:", err);
      toastError("Failed to Send", "Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    triggerWarningHaptic();
    deleteSticker.mutate(id);
  };

  const handleLongPress = (sticker: Sticker) => {
    triggerMediumHaptic();
    // Alert logic is inside StickerCard
  };

  const handleSave = async (
    name: string,
    imageUrl: string,
    description?: string
  ) => {
    triggerSuccessHaptic();
    createSticker.mutate({ name, imageUrl, description });
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    triggerLightHaptic();
    updateSticker.mutate({ id, isFavorite });
  };

  const totalCount = stickers.length;
  const favoriteCount = stickers.filter((s) => s.isFavorite).length;
  const predefinedCount = predefinedStickers.length;

  const sortedStickers = useMemo(() => {
    let filtered = [...stickers];
    if (showFavoritesOnly) {
      filtered = filtered.filter((s) => s.isFavorite);
    }
    // Sort favorites first, then by createdAt
    return filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [stickers, showFavoritesOnly]);

  const renderCustomItem: ListRenderItem<Sticker> = ({ item, index }) => (
    <Stack flex={1}>
      <StickerCard
        sticker={item}
        onSend={handleSend}
        onDelete={handleDelete}
        onLongPress={handleLongPress}
        onToggleFavorite={handleToggleFavorite}
        index={index}
        isPredefined={false}
      />
    </Stack>
  );

  const renderPredefinedItem: ListRenderItem<Sticker> = ({ item, index }) => (
    <Stack flex={1}>
      <StickerCard
        sticker={item}
        onSend={handleSend}
        index={index}
        isPredefined={true}
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
              triggerLightHaptic();
              setModalVisible(true);
            }}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
          >
            <ImagePlus size={22} color="white" />
          </Button>
        </XStack>

        {/* Summary pill */}
        <XStack alignItems="center" justifyContent="space-between">
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
              {activeTab === "custom"
                ? showFavoritesOnly
                  ? `${sortedStickers.length} favorite${
                      sortedStickers.length === 1 ? "" : "s"
                    }`
                  : `${totalCount} custom sticker${totalCount === 1 ? "" : "s"}`
                : `${predefinedCount} pre-defined sticker${
                    predefinedCount === 1 ? "" : "s"
                  }`}
            </Text>
          </XStack>

          {/* Favorites filter toggle (only on custom tab) */}
          {activeTab === "custom" && favoriteCount > 0 && (
            <Button
              size="$2"
              backgroundColor={showFavoritesOnly ? "$primary" : "$bgSoft"}
              borderRadius="$6"
              paddingHorizontal="$3"
              onPress={() => {
                triggerLightHaptic();
                setShowFavoritesOnly(!showFavoritesOnly);
              }}
              pressStyle={{ opacity: 0.8, scale: 0.97 }}
            >
              <XStack alignItems="center" gap="$1.5">
                <Heart
                  size={14}
                  color={showFavoritesOnly ? "white" : "$primary"}
                  fill={showFavoritesOnly ? "white" : "transparent"}
                />
                <Text
                  color={showFavoritesOnly ? "white" : "$primary"}
                  fontSize={12}
                  fontWeight="600"
                >
                  {favoriteCount}
                </Text>
              </XStack>
            </Button>
          )}
        </XStack>
      </YStack>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          triggerLightHaptic();
          setActiveTab(value as "custom" | "predefined");
        }}
        orientation="horizontal"
        flexDirection="column"
        flex={1}
      >
        <Tabs.List
          backgroundColor="$bgSoft"
          borderRadius="$6"
          padding="$1"
          marginBottom="$3"
          height={44}
        >
          <Tabs.Tab
            value="custom"
            flex={1}
            backgroundColor={activeTab === "custom" ? "$bg" : "transparent"}
            borderRadius="$5"
            pressStyle={{ opacity: 0.8 }}
            height={36}
            justifyContent="center"
            alignItems="center"
          >
            <Text
              fontWeight={activeTab === "custom" ? "700" : "500"}
              color={activeTab === "custom" ? "$color" : "$muted"}
              fontSize={14}
            >
              My Stickers
            </Text>
          </Tabs.Tab>
          <Tabs.Tab
            value="predefined"
            flex={1}
            backgroundColor={activeTab === "predefined" ? "$bg" : "transparent"}
            borderRadius="$5"
            pressStyle={{ opacity: 0.8 }}
            height={36}
            justifyContent="center"
            alignItems="center"
          >
            <Text
              fontWeight={activeTab === "predefined" ? "700" : "500"}
              color={activeTab === "predefined" ? "$color" : "$muted"}
              fontSize={14}
            >
              Pre-defined
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        {/* Custom Stickers Tab */}
        <Tabs.Content value="custom" flex={1}>
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
                  No custom stickers yet
                </Text>
                <Text
                  color="$muted"
                  fontSize={14}
                  textAlign="center"
                  maxWidth={280}
                >
                  Turn your inside jokes and favorite moments into little
                  stickers you can send in a tap.
                </Text>
              </YStack>

              <Button
                backgroundColor="$primary"
                borderRadius="$7"
                height={46}
                paddingHorizontal="$6"
                onPress={() => {
                  triggerLightHaptic();
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
              key={`custom-${numColumns}`}
              data={sortedStickers}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              contentContainerStyle={{
                paddingBottom: 24,
              }}
              columnWrapperStyle={{ gap: 16, paddingHorizontal: 4 }}
              ItemSeparatorComponent={() => <Stack height={16} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              showsVerticalScrollIndicator={false}
              renderItem={renderCustomItem}
            />
          )}
        </Tabs.Content>

        {/* Predefined Stickers Tab */}
        <Tabs.Content value="predefined" flex={1}>
          {predefinedLoading ? (
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
          ) : predefinedStickers.length === 0 ? (
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
                  No pre-defined stickers available
                </Text>
                <Text
                  color="$muted"
                  fontSize={14}
                  textAlign="center"
                  maxWidth={280}
                >
                  Pre-defined stickers will appear here once they're added to
                  the app.
                </Text>
              </YStack>
            </Stack>
          ) : (
            /* Gallery grid */
            <FlatList
              key={`predefined-${numColumns}`}
              data={predefinedStickers}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              contentContainerStyle={{
                paddingBottom: 24,
              }}
              columnWrapperStyle={{ gap: 16, paddingHorizontal: 4 }}
              ItemSeparatorComponent={() => <Stack height={16} />}
              showsVerticalScrollIndicator={false}
              renderItem={renderPredefinedItem}
            />
          )}
        </Tabs.Content>
      </Tabs>

      {/* Add Sticker Modal */}
      <AddStickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </ScreenContainer>
  );
}
