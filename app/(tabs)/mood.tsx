import { useState, useMemo } from "react";
import { RefreshControl, FlatList } from "react-native";
import { YStack, XStack, Text, Button, Stack, Spinner } from "tamagui";
import { Smile, TrendingUp, Plus } from "@tamagui/lucide-icons";

import {
  useMoodEntries,
  usePartnerMood,
  useTodayMood,
  useCreateMood,
  useUpdateMood,
} from "@/hooks/useMood";
import {
  MoodCard,
  MoodWidget,
  MoodEntryModal,
  ScreenContainer,
} from "@/components";
import { MoodEntry, MoodLevel, MOOD_EMOJIS, MOOD_LABELS } from "@/types";
import { triggerLightHaptic } from "@/state/haptics";
import { useToast } from "@/hooks/useToast";

export default function MoodScreen() {
  const { data: moodEntries = [], isLoading, refetch } = useMoodEntries();
  const { data: partnerMood } = usePartnerMood();
  const { data: todayMood } = useTodayMood();
  const createMood = useCreateMood();
  const updateMood = useUpdateMood();
  const { success } = useToast();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMood, setEditingMood] = useState<MoodEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    triggerLightHaptic();
    await refetch();
    setRefreshing(false);
  };

  const handleOpenModal = () => {
    triggerLightHaptic();
    setEditingMood(todayMood || null);
    setModalVisible(true);
  };

  const handleEditMood = (mood: MoodEntry) => {
    triggerLightHaptic();
    setEditingMood(mood);
    setModalVisible(true);
  };

  const handleSaveMood = async (data: {
    level: MoodLevel;
    note?: string;
    isPrivate: boolean;
  }) => {
    try {
      if (editingMood) {
        await updateMood.mutateAsync({
          id: editingMood.id,
          updates: data,
        });
        success("Mood Updated", "Your mood has been updated");
      } else {
        await createMood.mutateAsync(data);
        success("Mood Saved", "Your mood has been recorded");
      }
      setModalVisible(false);
      setEditingMood(null);
    } catch (error) {
      console.error("Failed to save mood:", error);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingMood(null);
  };

  // Calculate mood stats
  const moodStats = useMemo(() => {
    if (moodEntries.length === 0) return null;

    const total = moodEntries.reduce((sum, m) => sum + m.level, 0);
    const average = total / moodEntries.length;
    const roundedAvg = Math.round(average) as MoodLevel;

    // Count moods by level
    const distribution: Record<MoodLevel, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    moodEntries.forEach((m) => {
      distribution[m.level]++;
    });

    return {
      average: roundedAvg,
      total: moodEntries.length,
      distribution,
    };
  }, [moodEntries]);

  const hasAnyMoods = moodEntries.length > 0;

  return (
    <ScreenContainer scroll={false}>
      {/* Header */}
      <YStack padding="$5" paddingTop="$6" gap="$4">
        <XStack alignItems="center" justifyContent="space-between">
          <YStack gap="$1">
            <Text
              fontFamily="$heading"
              color="$color"
              fontSize={26}
              fontWeight="800"
            >
              Mood
            </Text>
            <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
              Track and share how you're feeling
            </Text>
          </YStack>

          <Button
            width={44}
            height={44}
            borderRadius="$8"
            backgroundColor="$primary"
            padding={0}
            onPress={handleOpenModal}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
          >
            <Plus size={22} color="white" />
          </Button>
        </XStack>

        {/* Quick Stats */}
        {moodStats && (
          <XStack gap="$3">
            <XStack
              flex={1}
              backgroundColor="$bgCard"
              borderRadius="$6"
              padding="$3"
              alignItems="center"
              gap="$2"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text fontSize={24}>{MOOD_EMOJIS[moodStats.average]}</Text>
              <YStack>
                <Text fontFamily="$body" fontSize={12} color="$colorMuted">
                  Average
                </Text>
                <Text
                  fontFamily="$body"
                  fontSize={14}
                  fontWeight="600"
                  color="$color"
                >
                  {MOOD_LABELS[moodStats.average]}
                </Text>
              </YStack>
            </XStack>

            <XStack
              flex={1}
              backgroundColor="$bgCard"
              borderRadius="$6"
              padding="$3"
              alignItems="center"
              gap="$2"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <TrendingUp size={24} color="$primary" />
              <YStack>
                <Text fontFamily="$body" fontSize={12} color="$colorMuted">
                  Entries
                </Text>
                <Text
                  fontFamily="$body"
                  fontSize={14}
                  fontWeight="600"
                  color="$color"
                >
                  {moodStats.total} logged
                </Text>
              </YStack>
            </XStack>
          </XStack>
        )}
      </YStack>

      {/* Partner Mood Widget */}
      {partnerMood && (
        <YStack paddingHorizontal="$5" paddingBottom="$4">
          <MoodWidget
            myMood={todayMood}
            partnerMood={partnerMood}
            onPress={handleOpenModal}
          />
        </YStack>
      )}

      {/* Content */}
      {isLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$primary" />
        </YStack>
      ) : !hasAnyMoods ? (
        /* Empty State */
        <Stack
          flex={1}
          alignItems="center"
          justifyContent="center"
          paddingVertical="$10"
          paddingHorizontal="$5"
          gap="$4"
        >
          <Stack
            width={80}
            height={80}
            borderRadius={40}
            backgroundColor="$primarySoft"
            alignItems="center"
            justifyContent="center"
          >
            <Smile size={40} color="$primary" />
          </Stack>
          <YStack gap="$2" alignItems="center">
            <Text
              fontFamily="$heading"
              color="$color"
              fontSize={20}
              fontWeight="700"
            >
              No moods logged yet
            </Text>
            <Text
              fontFamily="$body"
              color="$colorMuted"
              fontSize={15}
              textAlign="center"
              maxWidth={280}
            >
              Start tracking your mood to share how you're feeling with your
              partner.
            </Text>
          </YStack>
          <Button
            backgroundColor="$primary"
            borderRadius="$8"
            height={48}
            paddingHorizontal="$6"
            onPress={handleOpenModal}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
            marginTop="$2"
          >
            <XStack alignItems="center" gap="$2">
              <Plus size={18} color="white" />
              <Text
                fontFamily="$body"
                color="white"
                fontWeight="700"
                fontSize={16}
              >
                Log your first mood
              </Text>
            </XStack>
          </Button>
        </Stack>
      ) : (
        /* Mood History */
        <YStack flex={1} paddingHorizontal="$5">
          <Text
            fontFamily="$heading"
            fontSize={16}
            fontWeight="700"
            color="$color"
            marginBottom="$3"
          >
            Mood History
          </Text>
          <FlatList
            data={moodEntries}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ItemSeparatorComponent={() => <Stack height={12} />}
            renderItem={({ item }) => (
              <MoodCard mood={item} onPress={handleEditMood} showNote />
            )}
          />
        </YStack>
      )}

      {/* Mood Entry Modal */}
      <MoodEntryModal
        visible={modalVisible}
        existingMood={editingMood}
        onClose={handleCloseModal}
        onSave={handleSaveMood}
      />
    </ScreenContainer>
  );
}
