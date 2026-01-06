import { YStack, XStack, Text, Stack } from "tamagui";

import { MoodEntry, MOOD_EMOJIS, MOOD_LABELS } from "@/types";

type Props = {
  myMood?: MoodEntry | null;
  partnerMood?: MoodEntry | null;
  partnerName?: string;
  onPress?: () => void;
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return "over a day ago";
}

export function MoodWidget({
  myMood,
  partnerMood,
  partnerName = "Partner",
  onPress,
}: Props) {
  return (
    <YStack
      backgroundColor="$bgCard"
      borderRadius="$8"
      padding="$4"
      gap="$4"
      borderWidth={1}
      borderColor="$borderColor"
      pressStyle={onPress ? { opacity: 0.9, scale: 0.98 } : undefined}
      onPress={onPress}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <Text
          fontFamily="$heading"
          fontSize={16}
          fontWeight="700"
          color="$color"
        >
          Mood Check-in
        </Text>
        <Text fontFamily="$body" fontSize={12} color="$primary">
          Tap to update →
        </Text>
      </XStack>

      <XStack gap="$4" justifyContent="space-around">
        {/* My Mood */}
        <MoodDisplay label="You" mood={myMood} placeholder="Not set" />

        {/* Divider */}
        <Stack width={1} backgroundColor="$borderColor" />

        {/* Partner Mood */}
        <MoodDisplay
          label={partnerName}
          mood={partnerMood}
          placeholder="No update"
        />
      </XStack>
    </YStack>
  );
}

type MoodDisplayProps = {
  label: string;
  mood?: MoodEntry | null;
  placeholder: string;
};

function MoodDisplay({ label, mood, placeholder }: MoodDisplayProps) {
  const emoji = mood ? MOOD_EMOJIS[mood.level] : "❓";
  const moodLabel = mood ? MOOD_LABELS[mood.level] : placeholder;
  const timeStr = mood ? formatRelativeTime(mood.createdAt) : "";

  return (
    <YStack flex={1} alignItems="center" gap="$2">
      <Text fontFamily="$body" fontSize={12} color="$colorMuted">
        {label}
      </Text>
      <Stack
        width={52}
        height={52}
        borderRadius={26}
        backgroundColor={mood ? "$primarySoft" : "$bgSoft"}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize={28}>{emoji}</Text>
      </Stack>
      <YStack alignItems="center" gap="$0.5">
        <Text
          fontFamily="$body"
          fontSize={13}
          fontWeight="600"
          color={mood ? "$color" : "$colorMuted"}
        >
          {moodLabel}
        </Text>
        {timeStr && (
          <Text fontFamily="$body" fontSize={10} color="$colorMuted">
            {timeStr}
          </Text>
        )}
      </YStack>
    </YStack>
  );
}
