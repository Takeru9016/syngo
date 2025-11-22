import { Modal, Linking, Alert } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  Stack,
  ScrollView,
  Image,
} from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  X,
  Film,
  UtensilsCrossed,
  MapPin,
  MessageSquareQuote,
  Link2,
  Star,
  ExternalLink,
  Pencil,
  Trash2,
} from "@tamagui/lucide-icons";

import { Favorite, FavoriteCategory } from "@/types";

type Props = {
  visible: boolean;
  favorite: Favorite | null;
  onClose: () => void;
  onEdit: (favorite: Favorite) => void;
  onDelete: (id: string) => void;
};

const categoryIcon = (cat: FavoriteCategory) => {
  switch (cat) {
    case "movie":
      return Film;
    case "food":
      return UtensilsCrossed;
    case "place":
      return MapPin;
    case "quote":
      return MessageSquareQuote;
    case "link":
      return Link2;
    case "other":
    default:
      return Star;
  }
};

export function FavoriteDetailModal({
  visible,
  favorite,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();

  if (!favorite) return null;

  const Icon = categoryIcon(favorite.category);

  const handleDelete = () => {
    Alert.alert(
      "Delete favorite",
      "Are you sure you want to delete this favorite?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(favorite.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleOpenUrl = async () => {
    if (!favorite.url) return;

    let urlToOpen = favorite.url.trim();
    if (!urlToOpen.startsWith("http://") && !urlToOpen.startsWith("https://")) {
      urlToOpen = "https://" + urlToOpen;
    }

    const canOpen = await Linking.canOpenURL(urlToOpen);
    if (canOpen) {
      Linking.openURL(urlToOpen).catch((err) => {
        console.error("Failed to open URL:", err);
        Alert.alert("Error", "Could not open this link");
      });
    } else {
      Alert.alert("Invalid URL", "This link cannot be opened");
    }
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Stack
        flex={1}
        backgroundColor="rgba(0,0,0,0.5)"
        justifyContent="flex-end"
      >
        <Stack
          backgroundColor="$bg"
          borderTopLeftRadius="$8"
          borderTopRightRadius="$8"
          maxHeight="85%"
        >
          <ScrollView
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 20) + 24,
            }}
            showsVerticalScrollIndicator
          >
            <YStack gap="$4">
              {/* Header */}
              <XStack
                alignItems="center"
                justifyContent="space-between"
                padding="$5"
                paddingBottom="$3"
              >
                <XStack gap="$2" alignItems="center">
                  <Stack
                    width={32}
                    height={32}
                    borderRadius={16}
                    backgroundColor="$primarySoft"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon size={18} color="$primary" />
                  </Stack>
                  <Text
                    fontFamily="$heading"
                    color="$color"
                    fontSize={18}
                    fontWeight="700"
                    textTransform="capitalize"
                  >
                    {favorite.category}
                  </Text>
                </XStack>
                <Button unstyled onPress={onClose} hitSlop={16}>
                  <X size={22} color="$colorMuted" />
                </Button>
              </XStack>

              {/* Image */}
              {favorite.imageUrl && (
                <Image
                  source={{ uri: favorite.imageUrl }}
                  width="100%"
                  height={260}
                  objectFit="cover"
                />
              )}

              {/* Content */}
              <YStack paddingHorizontal="$5" gap="$3">
                <Text
                  fontFamily="$heading"
                  color="$color"
                  fontSize={24}
                  fontWeight="800"
                >
                  {favorite.title}
                </Text>

                {favorite.description && (
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={16}
                    lineHeight={24}
                  >
                    {favorite.description}
                  </Text>
                )}

                {favorite.url && (
                  <YStack gap="$2">
                    <Button
                      backgroundColor="$bgCard"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius="$8"
                      height={44}
                      onPress={handleOpenUrl}
                      pressStyle={{ opacity: 0.85 }}
                    >
                      <XStack
                        gap="$2"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <ExternalLink size={18} color="$primary" />
                        <Text
                          fontFamily="$body"
                          color="$primary"
                          fontSize={15}
                          fontWeight="600"
                        >
                          Open link
                        </Text>
                      </XStack>
                    </Button>
                    <Text
                      fontFamily="$body"
                      color="$colorMuted"
                      fontSize={12}
                      numberOfLines={1}
                    >
                      {favorite.url}
                    </Text>
                  </YStack>
                )}

                <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
                  Added on {formatDate(favorite.createdAt)}
                </Text>
              </YStack>

              {/* Actions */}
              <YStack paddingHorizontal="$5" gap="$3" marginTop="$3">
                <Button
                  backgroundColor="$primary"
                  borderRadius="$8"
                  height={48}
                  onPress={() => {
                    onEdit(favorite);
                    onClose();
                  }}
                  pressStyle={{ opacity: 0.9 }}
                >
                  <XStack alignItems="center" justifyContent="center" gap="$2">
                    <Pencil size={18} color="white" />
                    <Text
                      fontFamily="$body"
                      color="white"
                      fontWeight="700"
                      fontSize={16}
                    >
                      Edit favorite
                    </Text>
                  </XStack>
                </Button>
                <Button
                  backgroundColor="transparent"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$8"
                  height={48}
                  onPress={handleDelete}
                  pressStyle={{ opacity: 0.85 }}
                >
                  <XStack alignItems="center" justifyContent="center" gap="$2">
                    <Trash2 size={18} color="#f44336" />
                    <Text
                      fontFamily="$body"
                      color="#f44336"
                      fontWeight="700"
                      fontSize={16}
                    >
                      Delete favorite
                    </Text>
                  </XStack>
                </Button>
              </YStack>
            </YStack>
          </ScrollView>
        </Stack>
      </Stack>
    </Modal>
  );
}
