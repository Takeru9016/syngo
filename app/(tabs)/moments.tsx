import { useState, useMemo } from "react";
import { RefreshControl, FlatList, useWindowDimensions } from "react-native";
import { YStack, XStack, Text, Button, Stack, Spinner, Tabs } from "tamagui";
import {
  BookmarkPlus,
  ImagePlus,
  Sparkles,
  HeartHandshake,
} from "@tamagui/lucide-icons";

import {
  useFavorites,
  useCreateFavorite,
  useUpdateFavorite,
  useDeleteFavorite,
} from "@/hooks/useFavorites";
import {
  useStickers,
  useCreateSticker,
  useUpdateSticker,
  useDeleteSticker,
} from "@/hooks/useStickers";
import { usePredefinedStickers } from "@/hooks/usePredefinedStickers";
import {
  FavoriteCard,
  FavoriteDetailModal,
  FavoriteFormModal,
  StickerCard,
  AddStickerModal,
  EditStickerModal,
  ScreenContainer,
} from "@/components";
import { Favorite, FavoriteCategory, Sticker } from "@/types";
import {
  triggerLightHaptic,
  triggerSuccessHaptic,
  triggerMediumHaptic,
  triggerWarningHaptic,
} from "@/state/haptics";
import { useToast } from "@/hooks/useToast";
import { AppNotificationService } from "@/services/notification/notification.service";

type TabValue = "favorites" | "stickers" | "predefined";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function MomentsScreen() {
  const [activeTab, setActiveTab] = useState<TabValue>("favorites");

  // Favorites hooks
  const {
    data: favorites = [],
    isLoading: favoritesLoading,
    refetch: refetchFavorites,
  } = useFavorites();
  const createFavorite = useCreateFavorite();
  const updateFavorite = useUpdateFavorite();
  const deleteFavorite = useDeleteFavorite();

  // Stickers hooks
  const {
    data: stickers = [],
    isLoading: stickersLoading,
    refetch: refetchStickers,
  } = useStickers();
  const { data: predefinedStickers = [], isLoading: predefinedLoading } =
    usePredefinedStickers();
  const createSticker = useCreateSticker();
  const updateSticker = useUpdateSticker();
  const deleteSticker = useDeleteSticker();

  const { success, error: toastError } = useToast();

  // Favorites state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(
    null
  );
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<
    FavoriteCategory | "all"
  >("all");

  // Stickers state
  const [stickerModalVisible, setStickerModalVisible] = useState(false);
  const [editStickerModalVisible, setEditStickerModalVisible] = useState(false);
  const [editingSticker, setEditingSticker] = useState<Sticker | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    triggerLightHaptic();
    if (activeTab === "favorites") {
      await refetchFavorites();
    } else {
      await refetchStickers();
    }
    setRefreshing(false);
  };

  // Favorites handlers
  const handleFavoritePress = (favorite: Favorite) => {
    triggerLightHaptic();
    setSelectedFavorite(favorite);
    setDetailModalVisible(true);
  };

  const handleEditFavorite = (favorite: Favorite) => {
    triggerLightHaptic();
    setEditingFavorite(favorite);
    setFormModalVisible(true);
  };

  const handleDeleteFavorite = (id: string) => {
    triggerWarningHaptic();
    deleteFavorite.mutate(id);
  };

  const handleSaveFavorite = (
    data: Omit<Favorite, "id" | "createdAt" | "createdBy">
  ) => {
    triggerSuccessHaptic();
    if (editingFavorite) {
      updateFavorite.mutate({ id: editingFavorite.id, updates: data });
    } else {
      createFavorite.mutate(data);
    }
    setEditingFavorite(null);
  };

  const handleCloseFormModal = () => {
    setFormModalVisible(false);
    setEditingFavorite(null);
  };

  // Stickers handlers
  const handleSendSticker = async (sticker: Sticker) => {
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

  const handleDeleteSticker = async (id: string) => {
    triggerWarningHaptic();
    deleteSticker.mutate(id);
  };

  const handleLongPressSticker = (sticker: Sticker) => {
    triggerMediumHaptic();
  };

  const handleSaveSticker = async (name: string, imageUrl: string) => {
    triggerSuccessHaptic();
    createSticker.mutate({ name, imageUrl });
  };

  const handleEditSticker = (sticker: Sticker) => {
    triggerLightHaptic();
    setEditingSticker(sticker);
    setEditStickerModalVisible(true);
  };

  const handleSaveEditSticker = (
    id: string,
    updates: { name?: string; description?: string; imageUrl?: string }
  ) => {
    triggerSuccessHaptic();
    updateSticker.mutate({ id, ...updates });
    success("Sticker Updated", "Your sticker has been updated!");
  };

  // Computed values
  const filteredFavorites = useMemo(() => {
    if (categoryFilter === "all") return favorites;
    return favorites.filter((f) => f.category === categoryFilter);
  }, [favorites, categoryFilter]);

  const sortedStickers = useMemo(() => [...stickers], [stickers]);

  const recentFavoritesCount = useMemo(() => {
    const now = Date.now();
    return favorites.filter((f) => now - f.createdAt < WEEK_MS).length;
  }, [favorites]);

  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 3 : 2;

  const categoryChips: { label: string; value: FavoriteCategory | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Movies", value: "movie" },
    { label: "Food", value: "food" },
    { label: "Places", value: "place" },
    { label: "Quotes", value: "quote" },
    { label: "Links", value: "link" },
    { label: "Other", value: "other" },
  ];

  const isLoading =
    activeTab === "favorites"
      ? favoritesLoading
      : activeTab === "stickers"
      ? stickersLoading
      : predefinedLoading;

  const handleAddPress = () => {
    triggerLightHaptic();
    if (activeTab === "favorites") {
      setFormModalVisible(true);
    } else if (activeTab === "stickers") {
      setStickerModalVisible(true);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      {/* Header */}
      <YStack
        paddingHorizontal="$5"
        paddingTop="$6"
        paddingBottom="$3"
        gap="$3"
      >
        <XStack alignItems="center" justifyContent="space-between">
          <YStack gap="$1">
            <Text
              fontFamily="$heading"
              color="$color"
              fontSize={26}
              fontWeight="800"
            >
              Moments
            </Text>
            <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
              Your shared gallery of special things
            </Text>
          </YStack>

          {activeTab !== "predefined" && (
            <Button
              width={44}
              height={44}
              borderRadius="$8"
              backgroundColor="$primary"
              padding={0}
              onPress={handleAddPress}
              pressStyle={{ opacity: 0.9, scale: 0.98 }}
            >
              {activeTab === "favorites" ? (
                <BookmarkPlus size={22} color="white" />
              ) : (
                <ImagePlus size={22} color="white" />
              )}
            </Button>
          )}
        </XStack>

        {/* Summary pill */}
        <XStack alignItems="center">
          <XStack
            alignItems="center"
            gap="$2"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$8"
            backgroundColor="$bgSoft"
          >
            <Sparkles size={16} color="$primary" />
            <Text color="$colorMuted" fontSize={12}>
              {activeTab === "favorites"
                ? `${favorites.length} saved${
                    recentFavoritesCount > 0
                      ? ` • ${recentFavoritesCount} this week`
                      : ""
                  }`
                : activeTab === "stickers"
                ? `${stickers.length} custom sticker${
                    stickers.length === 1 ? "" : "s"
                  }`
                : `${predefinedStickers.length} pre-defined`}
            </Text>
          </XStack>
        </XStack>
      </YStack>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          triggerLightHaptic();
          setActiveTab(value as TabValue);
        }}
        orientation="horizontal"
        flexDirection="column"
        flex={1}
        paddingHorizontal="$5"
      >
        <Tabs.List
          backgroundColor="$bgSoft"
          borderRadius="$6"
          padding="$1"
          marginBottom="$3"
          height={44}
        >
          <Tabs.Tab
            value="favorites"
            flex={1}
            backgroundColor={activeTab === "favorites" ? "$bg" : "transparent"}
            borderRadius="$5"
            pressStyle={{ opacity: 0.8 }}
            height={36}
            justifyContent="center"
            alignItems="center"
          >
            <Text
              fontWeight={activeTab === "favorites" ? "700" : "500"}
              color={activeTab === "favorites" ? "$color" : "$muted"}
              fontSize={13}
            >
              Favorites
            </Text>
          </Tabs.Tab>
          <Tabs.Tab
            value="stickers"
            flex={1}
            backgroundColor={activeTab === "stickers" ? "$bg" : "transparent"}
            borderRadius="$5"
            pressStyle={{ opacity: 0.8 }}
            height={36}
            justifyContent="center"
            alignItems="center"
          >
            <Text
              fontWeight={activeTab === "stickers" ? "700" : "500"}
              color={activeTab === "stickers" ? "$color" : "$muted"}
              fontSize={13}
            >
              Stickers
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
              fontSize={13}
            >
              Presets
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        {/* Favorites Tab */}
        <Tabs.Content value="favorites" flex={1}>
          {/* Category filter */}
          {favorites.length > 0 && (
            <XStack gap="$2" flexWrap="wrap" marginBottom="$3">
              {categoryChips.map((chip) => {
                const isActive = categoryFilter === chip.value;
                return (
                  <Button
                    key={chip.value}
                    unstyled
                    onPress={() => setCategoryFilter(chip.value)}
                    pressStyle={{ opacity: 0.85, scale: 0.98 }}
                    height={36}
                    justifyContent="center"
                  >
                    <XStack
                      paddingHorizontal="$3"
                      paddingVertical="$2"
                      borderRadius="$7"
                      backgroundColor={isActive ? "$primarySoft" : "$bgCard"}
                      borderWidth={isActive ? 1 : 0}
                      borderColor={isActive ? "$primary" : "transparent"}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        fontFamily="$body"
                        fontSize={12}
                        fontWeight={isActive ? "700" : "500"}
                        color={isActive ? "$primary" : "$colorMuted"}
                      >
                        {chip.label}
                      </Text>
                    </XStack>
                  </Button>
                );
              })}
            </XStack>
          )}

          {favoritesLoading ? (
            <YStack flex={1} alignItems="center" justifyContent="center">
              <Spinner size="large" color="$primary" />
            </YStack>
          ) : favorites.length === 0 ? (
            <EmptyFavoritesState onAdd={() => setFormModalVisible(true)} />
          ) : filteredFavorites.length === 0 ? (
            <EmptyFilterState />
          ) : (
            <FlatList
              key={`favorites-${numColumns}`}
              data={filteredFavorites}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              contentContainerStyle={{ paddingBottom: 24 }}
              columnWrapperStyle={{ gap: 12 }}
              ItemSeparatorComponent={() => <Stack height={12} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              renderItem={({ item, index }) => (
                <Stack flex={1}>
                  <FavoriteCard
                    favorite={item}
                    onPress={handleFavoritePress}
                    index={index}
                  />
                </Stack>
              )}
            />
          )}
        </Tabs.Content>

        {/* Custom Stickers Tab */}
        <Tabs.Content value="stickers" flex={1}>
          {stickersLoading ? (
            <YStack flex={1} alignItems="center" justifyContent="center">
              <Spinner size="large" color="$primary" />
            </YStack>
          ) : stickers.length === 0 ? (
            <EmptyStickersState onAdd={() => setStickerModalVisible(true)} />
          ) : (
            <FlatList
              key={`stickers-${numColumns}`}
              data={sortedStickers}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              contentContainerStyle={{ paddingBottom: 24 }}
              columnWrapperStyle={{ gap: 16, paddingHorizontal: 4 }}
              ItemSeparatorComponent={() => <Stack height={16} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <Stack flex={1}>
                  <StickerCard
                    sticker={item}
                    onSend={handleSendSticker}
                    onDelete={handleDeleteSticker}
                    onLongPress={handleLongPressSticker}
                    onEdit={handleEditSticker}
                    index={index}
                    isPredefined={false}
                  />
                </Stack>
              )}
            />
          )}
        </Tabs.Content>

        {/* Pre-defined Stickers Tab */}
        <Tabs.Content value="predefined" flex={1}>
          {predefinedLoading ? (
            <YStack flex={1} alignItems="center" justifyContent="center">
              <Spinner size="large" color="$primary" />
            </YStack>
          ) : predefinedStickers.length === 0 ? (
            <EmptyPredefinedState />
          ) : (
            <FlatList
              key={`predefined-${numColumns}`}
              data={predefinedStickers}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              contentContainerStyle={{ paddingBottom: 24 }}
              columnWrapperStyle={{ gap: 16, paddingHorizontal: 4 }}
              ItemSeparatorComponent={() => <Stack height={16} />}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <Stack flex={1}>
                  <StickerCard
                    sticker={item}
                    onSend={handleSendSticker}
                    index={index}
                    isPredefined={true}
                  />
                </Stack>
              )}
            />
          )}
        </Tabs.Content>
      </Tabs>

      {/* Modals */}
      <FavoriteDetailModal
        visible={detailModalVisible}
        favorite={selectedFavorite}
        onClose={() => setDetailModalVisible(false)}
        onEdit={handleEditFavorite}
        onDelete={handleDeleteFavorite}
      />

      <FavoriteFormModal
        visible={formModalVisible}
        favorite={editingFavorite}
        onClose={handleCloseFormModal}
        onSave={handleSaveFavorite}
      />

      <AddStickerModal
        visible={stickerModalVisible}
        onClose={() => setStickerModalVisible(false)}
        onSave={handleSaveSticker}
      />

      <EditStickerModal
        visible={editStickerModalVisible}
        sticker={editingSticker}
        onClose={() => {
          setEditStickerModalVisible(false);
          setEditingSticker(null);
        }}
        onSave={handleSaveEditSticker}
      />
    </ScreenContainer>
  );
}

// Empty states
function EmptyFavoritesState({ onAdd }: { onAdd: () => void }) {
  return (
    <Stack
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingVertical="$10"
      gap="$4"
    >
      <Stack
        width={64}
        height={64}
        borderRadius={32}
        backgroundColor="$primarySoft"
        alignItems="center"
        justifyContent="center"
      >
        <HeartHandshake size={32} color="$primary" />
      </Stack>
      <YStack gap="$2" alignItems="center">
        <Text
          fontFamily="$heading"
          color="$color"
          fontSize={20}
          fontWeight="700"
        >
          No favorites yet
        </Text>
        <Text
          fontFamily="$body"
          color="$colorMuted"
          fontSize={15}
          textAlign="center"
          maxWidth={280}
        >
          Save your favorite movies, places, quotes, and more in one cozy place.
        </Text>
      </YStack>
      <Button
        backgroundColor="$primary"
        borderRadius="$8"
        height={48}
        paddingHorizontal="$6"
        onPress={() => {
          triggerLightHaptic();
          onAdd();
        }}
        pressStyle={{ opacity: 0.9, scale: 0.98 }}
        marginTop="$2"
      >
        <Text fontFamily="$body" color="white" fontWeight="700" fontSize={16}>
          Save your first favorite
        </Text>
      </Button>
    </Stack>
  );
}

function EmptyFilterState() {
  return (
    <Stack
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingVertical="$8"
      gap="$3"
    >
      <Stack
        width={64}
        height={64}
        borderRadius={32}
        backgroundColor="$primarySoft"
        alignItems="center"
        justifyContent="center"
      >
        <Sparkles size={28} color="$primary" />
      </Stack>
      <YStack gap="$2" alignItems="center">
        <Text
          fontFamily="$heading"
          color="$color"
          fontSize={18}
          fontWeight="700"
        >
          Nothing here yet
        </Text>
        <Text
          fontFamily="$body"
          color="$colorMuted"
          fontSize={14}
          textAlign="center"
          maxWidth={260}
        >
          Add a new favorite and it will show up under this filter.
        </Text>
      </YStack>
    </Stack>
  );
}

function EmptyStickersState({ onAdd }: { onAdd: () => void }) {
  return (
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
        <Text color="$muted" fontSize={14} textAlign="center" maxWidth={280}>
          Turn your inside jokes and favorite moments into little stickers you
          can send in a tap.
        </Text>
      </YStack>
      <Button
        backgroundColor="$primary"
        borderRadius="$7"
        height={46}
        paddingHorizontal="$6"
        onPress={() => {
          triggerLightHaptic();
          onAdd();
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
  );
}

function EmptyPredefinedState() {
  return (
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
        <Text color="$muted" fontSize={14} textAlign="center" maxWidth={280}>
          Pre-defined stickers will appear here once they're added to the app.
        </Text>
      </YStack>
    </Stack>
  );
}
