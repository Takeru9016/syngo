import { Image, YStack, XStack, Text, Stack, Button } from "tamagui";
import { Favorite, FavoriteCategory } from "@/types";

type Props = {
  favorite: Favorite;
  onPress: (favorite: Favorite) => void;
};

const categoryEmojis: Record<FavoriteCategory, string> = {
  movie: "🎬",
  food: "🍕",
  place: "📍",
  quote: "💭",
  link: "🔗",
  other: "⭐",
};

const categoryColors: Record<FavoriteCategory, string> = {
  movie: "#e91e63",
  food: "#ff9800",
  place: "#4caf50",
  quote: "#9c27b0",
  link: "#2196f3",
  other: "#607d8b",
};

export function FavoriteCard({ favorite, onPress }: Props) {
  const emoji = categoryEmojis[favorite.category];
  const color = categoryColors[favorite.category];

  return (
    <Button
      unstyled
      onPress={() => onPress(favorite)}
      pressStyle={{ opacity: 0.9, scale: 0.98 }}
    >
      <YStack
        backgroundColor="$bgCard"
        borderRadius="$8"
        overflow="hidden"
        borderWidth={1}
        borderColor="$borderColor"
        gap="$0"
      >
        {/* Image / placeholder */}
        {favorite.imageUrl ? (
          <Image
            source={{ uri: favorite.imageUrl }}
            width="100%"
            height={120}
            objectFit="cover"
          />
        ) : (
          <Stack
            width="100%"
            height={120}
            backgroundColor={color}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={40}>{emoji}</Text>
          </Stack>
        )}

        {/* Content */}
        <YStack padding="$3" gap="$2">
          <XStack alignItems="center" gap="$2">
            <Text fontSize={16}>{emoji}</Text>
            <Text
              fontFamily="$body"
              color="$colorMuted"
              fontSize={11}
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing={0.7}
              numberOfLines={1}
            >
              {favorite.category}
            </Text>
          </XStack>

          <Text
            fontFamily="$body"
            color="$color"
            fontSize={15}
            fontWeight="700"
            numberOfLines={2}
          >
            {favorite.title}
          </Text>

          {favorite.description && (
            <Text
              fontFamily="$body"
              color="$colorMuted"
              fontSize={13}
              numberOfLines={2}
            >
              {favorite.description}
            </Text>
          )}
        </YStack>
      </YStack>
    </Button>
  );
}
