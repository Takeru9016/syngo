import { YStack, XStack, Text, Stack } from "tamagui";
import { MessageSquare } from "@tamagui/lucide-icons";

import { MoodEntry, MOOD_EMOJIS, MOOD_LABELS } from "@/types";

type Props = {
  mood: MoodEntry;
  onPress?: (mood: MoodEntry) => void;
  showNote?: boolean;
  compact?: boolean;
};

function formatMoodTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function MoodCard({ mood, onPress, showNote = true, compact }: Props) {
  const emoji = MOOD_EMOJIS[mood.level];
  const label = MOOD_LABELS[mood.level];
  const timeStr = formatMoodTime(mood.createdAt);

  if (compact) {
    return (
      <XStack
        backgroundColor="$bgCard"
        borderRadius="$6"
        padding="$3"
        gap="$3"
        alignItems="center"
        borderWidth={1}
        borderColor="$borderColor"
        pressStyle={onPress ? { opacity: 0.8, scale: 0.98 } : undefined}
        onPress={onPress ? () => onPress(mood) : undefined}
      >
        <Text fontSize={28}>{emoji}</Text>
        <YStack flex={1} gap="$1">
          <Text
            fontFamily="$body"
            fontSize={14}
            fontWeight="600"
            color="$color"
          >
            {label}
          </Text>
          <Text fontFamily="$body" fontSize={12} color="$colorMuted">
            {timeStr}
          </Text>
        </YStack>
        {mood.note && <MessageSquare size={16} color="$colorMuted" />}
      </XStack>
    );
  }

  return (
    <YStack
      backgroundColor="$bgCard"
      borderRadius="$8"
      padding="$4"
      gap="$3"
      borderWidth={1}
      borderColor="$borderColor"
      pressStyle={onPress ? { opacity: 0.8, scale: 0.98 } : undefined}
      onPress={onPress ? () => onPress(mood) : undefined}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <XStack gap="$3" alignItems="center">
          <Stack
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor="$primarySoft"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={24}>{emoji}</Text>
          </Stack>
          <YStack gap="$1">
            <Text
              fontFamily="$heading"
              fontSize={16}
              fontWeight="700"
              color="$color"
            >
              {label}
            </Text>
            <Text fontFamily="$body" fontSize={12} color="$colorMuted">
              {timeStr}
            </Text>
          </YStack>
        </XStack>

        {mood.isPrivate && (
          <Stack
            backgroundColor="$bgSoft"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$4"
          >
            <Text fontFamily="$body" fontSize={10} color="$colorMuted">
              Private
            </Text>
          </Stack>
        )}
      </XStack>

      {showNote && mood.note && (
        <YStack
          backgroundColor="$bgSoft"
          borderRadius="$4"
          padding="$3"
          gap="$1"
        >
          <Text
            fontFamily="$body"
            fontSize={13}
            color="$color"
            numberOfLines={3}
          >
            {mood.note}
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
