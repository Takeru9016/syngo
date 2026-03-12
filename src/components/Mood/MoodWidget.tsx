import { YStack, XStack, Text, Stack, Button } from "tamagui";
import { Heart, ChevronRight, PlusSquare, HelpCircle } from "@tamagui/lucide-icons";

import { MoodEntry, MOOD_LABELS } from "@/types";
import { MoodIcon } from "./MoodIcon";
import { triggerSelectionHaptic } from "@/state/haptics";

type Props = {
  myMood?: MoodEntry | null;
  partnerMood?: MoodEntry | null;
  partnerName?: string;
  onPress?: () => void;
};

/**
 * MoodWidget - Shows both moods side by side on home screen
 */
export function MoodWidget({
  myMood,
  partnerMood,
  partnerName,
  onPress,
}: Props) {
  const hasAnyMood = myMood || partnerMood;

  if (!hasAnyMood) {
    return null;
  }

  return (
    <Button
      unstyled
      onPress={() => {
        triggerSelectionHaptic();
        onPress?.();
      }}
      pressStyle={{ opacity: 0.9, scale: 0.98 }}
    >
      <Stack
        backgroundColor="$bgCard"
        borderRadius="$8"
        padding="$4"
        borderWidth={1}
        borderColor="$borderColor"
        gap="$3"
      >
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap="$2">
            <Heart size={16} color="$primary" />
            <Text
              fontFamily="$body"
              fontSize={13}
              fontWeight="600"
              color="$colorMuted"
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              Mood Check-in
            </Text>
          </XStack>
          <ChevronRight size={18} color="$colorMuted" />
        </XStack>

        {/* Mood Cards */}
        <XStack gap="$3">
          {/* Your Mood */}
          <YStack
            flex={1}
            backgroundColor="$bgSoft"
            borderRadius="$6"
            padding="$3"
            alignItems="center"
            gap="$2"
          >
            <Stack height={32} justifyContent="center" alignItems="center">
              {myMood ? <MoodIcon level={myMood.level} size={32} /> : <PlusSquare size={28} color="$colorMuted" />}
            </Stack>
            <YStack alignItems="center" gap="$0.5">
              <Text
                fontFamily="$body"
                fontSize={13}
                fontWeight="600"
                color="$color"
              >
                {myMood ? MOOD_LABELS[myMood.level] : "Add yours"}
              </Text>
              <Text fontFamily="$body" fontSize={11} color="$colorMuted">
                You
              </Text>
            </YStack>
          </YStack>

          {/* Partner Mood */}
          <YStack
            flex={1}
            backgroundColor="$bgSoft"
            borderRadius="$6"
            padding="$3"
            alignItems="center"
            gap="$2"
          >
            <Stack height={32} justifyContent="center" alignItems="center">
              {partnerMood ? <MoodIcon level={partnerMood.level} size={32} /> : <HelpCircle size={28} color="$colorMuted" />}
            </Stack>
            <YStack alignItems="center" gap="$0.5">
              <Text
                fontFamily="$body"
                fontSize={13}
                fontWeight="600"
                color="$color"
              >
                {partnerMood ? MOOD_LABELS[partnerMood.level] : "Waiting..."}
              </Text>
              <Text fontFamily="$body" fontSize={11} color="$colorMuted">
                {partnerName || "Partner"}
              </Text>
            </YStack>
          </YStack>
        </XStack>
      </Stack>
    </Button>
  );
}
