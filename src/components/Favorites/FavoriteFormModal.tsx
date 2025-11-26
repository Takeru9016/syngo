import { useEffect, useState } from "react";
import { Modal, Platform, KeyboardAvoidingView, Alert } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  TextArea,
  Stack,
  ScrollView,
  Spinner,
  Image,
} from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  X,
  Film,
  UtensilsCrossed,
  MapPin,
  MessageSquareQuote,
  Link2,
  Star,
  Camera,
} from "@tamagui/lucide-icons";

import { Favorite, FavoriteCategory } from "@/types";
import { CloudinaryStorage } from "@/services/storage/cloudinary.adapter";

type Props = {
  visible: boolean;
  favorite?: Favorite | null;
  onClose: () => void;
  onSave: (data: Omit<Favorite, "id" | "createdAt" | "createdBy">) => void;
};

const categories: {
  value: FavoriteCategory;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  { value: "movie", label: "Movie", Icon: Film },
  { value: "food", label: "Food", Icon: UtensilsCrossed },
  { value: "place", label: "Place", Icon: MapPin },
  { value: "quote", label: "Quote", Icon: MessageSquareQuote },
  { value: "link", label: "Link", Icon: Link2 },
  { value: "other", label: "Other", Icon: Star },
];

export function FavoriteFormModal({
  visible,
  favorite,
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FavoriteCategory>("other");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | undefined>();

  useEffect(() => {
    if (favorite) {
      setTitle(favorite.title);
      setDescription(favorite.description);
      setCategory(favorite.category);
      setImageUrl(favorite.imageUrl);
      setUrl(favorite.url);
      setLocalPreview(favorite.imageUrl);
    } else {
      setTitle("");
      setDescription("");
      setCategory("other");
      setImageUrl(undefined);
      setUrl(undefined);
      setLocalPreview(undefined);
    }
  }, [favorite, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a title for your favorite");
      return;
    }
    if (uploading) {
      Alert.alert(
        "Upload in progress",
        "Please wait for image upload to complete"
      );
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      imageUrl,
      url: url?.trim(),
    });
    onClose();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant photo library access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const localUri = result.assets[0].uri;
    setLocalPreview(localUri);
    setUploading(true);

    try {
      const uploadResult = await CloudinaryStorage.upload(localUri, {
        folder: "favorites",
      });

      setImageUrl(uploadResult.url);
      setLocalPreview(uploadResult.url);
      Alert.alert("Success", "Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Upload failed", "Could not upload image. Please try again.");
      setLocalPreview(undefined);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl(undefined);
    setLocalPreview(undefined);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
                paddingBottom: Math.max(insets.bottom, 20) + 80,
              }}
              showsVerticalScrollIndicator
            >
              <YStack padding="$5" gap="$4">
                {/* Header */}
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack>
                    <Text
                      fontFamily="$heading"
                      color="$color"
                      fontSize={22}
                      fontWeight="800"
                    >
                      {favorite ? "Edit favorite" : "New favorite"}
                    </Text>
                    <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
                      Save something you both want to remember.
                    </Text>
                  </YStack>
                  <Button unstyled onPress={onClose} hitSlop={16}>
                    <X size={22} color="$colorMuted" />
                  </Button>
                </XStack>

                {/* Category */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    Category
                  </Text>
                  <XStack gap="$2" flexWrap="wrap">
                    {categories.map(({ value, label, Icon }) => {
                      const isActive = category === value;
                      return (
                        <Button
                          key={value}
                          backgroundColor={
                            isActive ? "$primarySoft" : "$bgCard"
                          }
                          borderColor={isActive ? "$primary" : "$borderColor"}
                          borderWidth={1}
                          borderRadius="$7"
                          height={40}
                          paddingHorizontal="$3"
                          onPress={() => setCategory(value)}
                          pressStyle={{ opacity: 0.85 }}
                        >
                          <XStack gap="$2" alignItems="center">
                            <Icon
                              size={16}
                              color={isActive ? "$primary" : "$colorMuted"}
                            />
                            <Text
                              fontFamily="$body"
                              color={isActive ? "$primary" : "$color"}
                              fontSize={14}
                              fontWeight="600"
                            >
                              {label}
                            </Text>
                          </XStack>
                        </Button>
                      );
                    })}
                  </XStack>
                </YStack>

                {/* Title */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    Title
                  </Text>
                  <Input
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Movie, restaurant, quote..."
                    backgroundColor="$bgCard"
                    borderColor="$borderColor"
                    borderRadius="$7"
                    height={44}
                    fontSize={15}
                    fontFamily="$body"
                    color="$color"
                  />
                </YStack>

                {/* Description */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    Description
                  </Text>
                  <TextArea
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Why is this special to you both? (optional)"
                    backgroundColor="$bgCard"
                    borderColor="$borderColor"
                    borderRadius="$7"
                    minHeight={90}
                    fontSize={15}
                    fontFamily="$body"
                    color="$color"
                    padding="$4"
                    verticalAlign="top" // esp. for Android
                    multiline
                  />
                </YStack>

                {/* URL (optional) */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    Link (optional)
                  </Text>
                  <Input
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://..."
                    backgroundColor="$bgCard"
                    borderColor="$borderColor"
                    borderRadius="$7"
                    height={44}
                    fontSize={15}
                    fontFamily="$body"
                    color="$color"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </YStack>

                {/* Image Picker */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    Image (optional)
                  </Text>

                  {localPreview && (
                    <Stack
                      backgroundColor="$bgCard"
                      borderRadius="$7"
                      overflow="hidden"
                      position="relative"
                    >
                      <Image
                        source={{ uri: localPreview }}
                        width="100%"
                        height={200}
                        resizeMode="cover"
                      />
                      {uploading && (
                        <Stack
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          backgroundColor="rgba(0,0,0,0.6)"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Spinner size="large" color="white" />
                          <Text
                            fontFamily="$body"
                            color="white"
                            fontSize={14}
                            marginTop="$2"
                          >
                            Uploading...
                          </Text>
                        </Stack>
                      )}
                      {!uploading && (
                        <Button
                          position="absolute"
                          top="$2"
                          right="$2"
                          backgroundColor="rgba(0,0,0,0.7)"
                          borderRadius="$8"
                          width={32}
                          height={32}
                          padding={0}
                          onPress={removeImage}
                          pressStyle={{ opacity: 0.85 }}
                        >
                          <X size={18} color="white" />
                        </Button>
                      )}
                    </Stack>
                  )}

                  <Button
                    backgroundColor="$bgCard"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$7"
                    height={44}
                    onPress={pickImage}
                    disabled={uploading}
                    opacity={uploading ? 0.5 : 1}
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <XStack
                      gap="$2"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {uploading ? (
                        <Spinner size="small" />
                      ) : (
                        <Camera size={18} color="$colorMuted" />
                      )}
                      <Text
                        fontFamily="$body"
                        color="$color"
                        fontSize={15}
                        fontWeight="600"
                      >
                        {uploading
                          ? "Uploading..."
                          : localPreview
                          ? "Change image"
                          : "Pick image"}
                      </Text>
                    </XStack>
                  </Button>
                </YStack>

                {/* Save Button */}
                <Button
                  backgroundColor="$primary"
                  borderRadius="$8"
                  height={48}
                  onPress={handleSave}
                  disabled={!title.trim() || uploading}
                  opacity={!title.trim() || uploading ? 0.5 : 1}
                  pressStyle={{ opacity: 0.85 }}
                  marginTop="$2"
                >
                  {uploading ? (
                    <XStack
                      gap="$2"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Spinner size="small" color="white" />
                      <Text
                        fontFamily="$body"
                        color="white"
                        fontWeight="700"
                        fontSize={16}
                      >
                        Uploading...
                      </Text>
                    </XStack>
                  ) : (
                    <Text
                      fontFamily="$body"
                      color="white"
                      fontWeight="700"
                      fontSize={16}
                    >
                      {favorite ? "Update favorite" : "Add favorite"}
                    </Text>
                  )}
                </Button>
              </YStack>
            </ScrollView>
          </Stack>
        </Stack>
      </KeyboardAvoidingView>
    </Modal>
  );
}
