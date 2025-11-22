import { useMemo, useState } from "react";
import { RefreshControl, FlatList } from "react-native";
import { YStack, XStack, Text, Button, Stack, Spinner } from "tamagui";
import { Star, BookmarkPlus, HeartHandshake } from "@tamagui/lucide-icons";

import {
  useFavorites,
  useCreateFavorite,
  useUpdateFavorite,
  useDeleteFavorite,
} from "@/hooks/useFavorites";
import {
  FavoriteCard,
  FavoriteDetailModal,
  FavoriteFormModal,
  ScreenContainer,
} from "@/components";
import { Favorite, FavoriteCategory } from "@/types";
import {
  triggerLightHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
} from "@/state/haptics";

type CategoryFilter = FavoriteCategory | "all";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function FavoritesScreen() {
  const { data: favorites = [], isLoading, refetch } = useFavorites();
  const createFavorite = useCreateFavorite();
  const updateFavorite = useUpdateFavorite();
  const deleteFavorite = useDeleteFavorite();

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(
    null
  );
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const handleRefresh = async () => {
    setRefreshing(true);
    triggerLightHaptic();
    await refetch();
    setRefreshing(false);
  };

  const handlePress = (favorite: Favorite) => {
    triggerLightHaptic();
    setSelectedFavorite(favorite);
    setDetailModalVisible(true);
  };

  const handleEdit = (favorite: Favorite) => {
    triggerLightHaptic();
    setEditingFavorite(favorite);
    setFormModalVisible(true);
  };

  const handleDelete = (id: string) => {
    triggerWarningHaptic();
    deleteFavorite.mutate(id);
  };

  const handleSave = (
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

  const totalCount = favorites.length;

  const recentCount = useMemo(() => {
    const now = Date.now();
    return favorites.filter((f) => now - f.createdAt < WEEK_MS).length;
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    if (categoryFilter === "all") return favorites;
    return favorites.filter((f) => f.category === categoryFilter);
  }, [favorites, categoryFilter]);

  const hasAnyFavorites = favorites.length > 0;

  const categoryChips: { label: string; value: CategoryFilter }[] = [
    { label: "All", value: "all" },
    { label: "Movies", value: "movie" },
    { label: "Food", value: "food" },
    { label: "Places", value: "place" },
    { label: "Quotes", value: "quote" },
    { label: "Links", value: "link" },
    { label: "Other", value: "other" },
  ];

  return (
    <ScreenContainer scroll={false}>
      {/* Header */}
      <YStack padding="$5" paddingTop="$6" gap="$4">
        <YStack gap="$2">
          <XStack alignItems="center" justifyContent="center" gap="$2">
            <YStack gap="$1">
              <Text
                fontFamily="$heading"
                color="$color"
                fontSize={26}
                fontWeight="800"
              >
                Favorites
              </Text>
              <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
                Moments, links, and little things you both care about.
              </Text>
            </YStack>

            <Button
              width={44}
              height={44}
              borderRadius="$8"
              backgroundColor="$primarySoft"
              borderWidth={1}
              borderColor="$primary"
              padding={0}
              onPress={() => {
                triggerLightHaptic();
                setFormModalVisible(true);
              }}
              pressStyle={{ opacity: 0.9, scale: 0.98 }}
            >
              <BookmarkPlus size={22} color="$primary" />
            </Button>
          </XStack>

          <XStack gap="$2" alignItems="center" marginTop="$2">
            <XStack
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$5"
              backgroundColor="$bgCard"
              alignItems="center"
              gap="$2"
            >
              <Star size={16} color="$primary" />
              <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
                {totalCount} saved
                {recentCount > 0 && ` • ${recentCount} this week`}
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Category filter */}
        {hasAnyFavorites && (
          <XStack gap="$2" flexWrap="wrap">
            {categoryChips.map((chip) => {
              const isActive = categoryFilter === chip.value;
              return (
                <Button
                  key={chip.value}
                  unstyled
                  onPress={() => setCategoryFilter(chip.value)}
                  pressStyle={{ opacity: 0.85, scale: 0.98 }}
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
                      fontSize={13}
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
      </YStack>

      {/* Loading / Empty / Grid */}
      {isLoading ? (
        <YStack padding="$5" gap="$3">
          {[1, 2].map((row) => (
            <XStack key={row} gap="$3">
              {[1, 2].map((col) => (
                <Stack
                  key={`${row}-${col}`}
                  flex={1}
                  backgroundColor="$bgCard"
                  borderRadius="$8"
                  height={190}
                  borderWidth={1}
                  borderColor="$borderColor"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner size="small" color="$primary" />
                </Stack>
              ))}
            </XStack>
          ))}
        </YStack>
      ) : !hasAnyFavorites ? (
        // Global empty
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
              Save your favorite movies, places, quotes, and more in one cozy
              place.
            </Text>
          </YStack>
          <Button
            backgroundColor="$primary"
            borderRadius="$8"
            height={48}
            paddingHorizontal="$6"
            onPress={() => {
              triggerLightHaptic();
              setFormModalVisible(true);
            }}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
            marginTop="$2"
          >
            <Text
              fontFamily="$body"
              color="white"
              fontWeight="700"
              fontSize={16}
            >
              Save your first favorite
            </Text>
          </Button>
        </Stack>
      ) : filteredFavorites.length === 0 ? (
        // Category-specific empty
        <Stack
          flex={1}
          alignItems="center"
          justifyContent="center"
          paddingVertical="$8"
          paddingHorizontal="$5"
          gap="$3"
        >
          <Text fontSize={40}>✨</Text>
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
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <Stack height={12} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <Stack flex={1}>
              <FavoriteCard favorite={item} onPress={handlePress} />
            </Stack>
          )}
        />
      )}

      {/* Detail Modal */}
      <FavoriteDetailModal
        visible={detailModalVisible}
        favorite={selectedFavorite}
        onClose={() => setDetailModalVisible(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <FavoriteFormModal
        visible={formModalVisible}
        favorite={editingFavorite}
        onClose={handleCloseFormModal}
        onSave={handleSave}
      />
    </ScreenContainer>
  );
}
