import { useState } from "react";
import { RefreshControl, FlatList } from "react-native";
import * as Haptics from "expo-haptics";
import { YStack, XStack, Text, Button, Stack, Spinner } from "tamagui";

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
import { Favorite } from "@/types";

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

  const handlePress = (favorite: Favorite) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFavorite(favorite);
    setDetailModalVisible(true);
  };

  const handleEdit = (favorite: Favorite) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingFavorite(favorite);
    setFormModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteFavorite.mutate(id);
  };

  const handleSave = async (
    data: Omit<Favorite, "id" | "createdAt" | "createdBy">
  ) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  return (
    <ScreenContainer title="Favorites">
      <YStack flex={1} backgroundColor="$bg">
        {/* Header */}
        <YStack padding="$4" paddingTop="$6" gap="$4">
          <XStack alignItems="center" justifyContent="space-between">
            <Text color="$color" fontSize={28} fontWeight="900">
              Create Favorite
            </Text>
            <Button
              backgroundColor="$primary"
              borderRadius="$7"
              width={44}
              height={44}
              padding={0}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFormModalVisible(true);
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
            {[1, 2, 3].map((i) => (
              <Stack
                key={i}
                backgroundColor="$background"
                borderRadius="$6"
                height={200}
              >
                <Spinner size="small" />
              </Stack>
            ))}
          </YStack>
        ) : favorites.length === 0 ? (
          /* Empty State */
          <Stack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingVertical="$10"
            gap="$4"
          >
            <Text fontSize={64}>⭐</Text>
            <YStack gap="$2" alignItems="center">
              <Text color="$color" fontSize={20} fontWeight="700">
                No favorites yet
              </Text>
              <Text
                color="$muted"
                fontSize={15}
                textAlign="center"
                maxWidth={280}
              >
                Save your favorite movies, places, quotes, and more
              </Text>
            </YStack>
            <Button
              backgroundColor="$primary"
              borderRadius="$6"
              height={48}
              paddingHorizontal="$6"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFormModalVisible(true);
              }}
              pressStyle={{ opacity: 0.8 }}
              marginTop="$2"
            >
              <Text color="white" fontWeight="700" fontSize={16}>
                Add Favorite
              </Text>
            </Button>
          </Stack>
        ) : (
          /* Favorites Grid */
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ padding: 16, paddingTop: 0 }}
            columnWrapperStyle={{ gap: 12 }}
            ItemSeparatorComponent={() => <Stack height={12} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
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
      </YStack>
    </ScreenContainer>
  );
}
