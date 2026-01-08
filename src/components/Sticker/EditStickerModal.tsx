import { useState, useEffect } from "react";
import { Modal, Platform, KeyboardAvoidingView } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Stack,
  ScrollView,
  Image,
  Spinner,
} from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Image as LucideImage, Camera, X, Pencil } from "@tamagui/lucide-icons";

import { CloudinaryStorage } from "@/services/storage/cloudinary.adapter";
import { useToast } from "@/hooks/useToast";
import { Sticker } from "@/types";

type Props = {
  visible: boolean;
  sticker: Sticker | null;
  onClose: () => void;
  onSave: (
    id: string,
    updates: { name?: string; description?: string; imageUrl?: string }
  ) => void;
};

export function EditStickerModal({ visible, sticker, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const { success, error: toastError, info } = useToast();

  // Pre-populate fields when sticker changes
  useEffect(() => {
    if (sticker) {
      setName(sticker.name || "");
      setDescription(sticker.description || "");
      setImageUrl(sticker.imageUrl || null);
      setLocalPreview(sticker.imageUrl || null);
      setHasImageChanged(false);
    }
  }, [sticker]);

  const handleClose = () => {
    setName("");
    setDescription("");
    setImageUrl(null);
    setLocalPreview(null);
    setHasImageChanged(false);
    onClose();
  };

  const handleSave = () => {
    if (!sticker) return;

    if (!name.trim()) {
      toastError("Missing Name", "Please provide a name for your sticker");
      return;
    }

    if (!imageUrl) {
      toastError("Missing Image", "Please select an image");
      return;
    }

    if (uploading) {
      info("Upload in progress", "Please wait for image upload to complete");
      return;
    }

    const updates: { name?: string; description?: string; imageUrl?: string } =
      {};

    // Only include fields that changed
    if (name.trim() !== sticker.name) {
      updates.name = name.trim();
    }
    if (description.trim() !== (sticker.description || "")) {
      updates.description = description.trim();
    }
    if (hasImageChanged && imageUrl !== sticker.imageUrl) {
      updates.imageUrl = imageUrl;
    }

    // Only save if something changed
    if (Object.keys(updates).length > 0) {
      onSave(sticker.id, updates);
    }

    handleClose();
  };

  const uploadImage = async (localUri: string) => {
    setLocalPreview(localUri);
    setUploading(true);

    try {
      const result = await CloudinaryStorage.upload(localUri, {
        folder: "stickers",
      });

      setImageUrl(result.url);
      setLocalPreview(result.url);
      setHasImageChanged(true);
      success("Image Uploaded", "Ready to save changes!");
    } catch (err) {
      console.error("Upload failed:", err);
      toastError("Upload Failed", "Could not upload image. Please try again.");
      // Restore original image
      setLocalPreview(sticker?.imageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toastError("Permission Needed", "Please grant photo library access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;
    if (!result.assets[0]) return;

    const localUri = result.assets[0].uri;
    await uploadImage(localUri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      toastError("Permission Needed", "Please grant camera access");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;
    if (!result.assets[0]) return;

    const localUri = result.assets[0].uri;
    await uploadImage(localUri);
  };

  if (!sticker) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
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
              <YStack padding="$4" gap="$4">
                {/* Header */}
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <Pencil color="$primary" size={22} />
                    <Text
                      fontFamily="$heading"
                      color="$color"
                      fontSize={22}
                      fontWeight="900"
                    >
                      Edit Sticker
                    </Text>
                  </XStack>
                  <Button
                    unstyled
                    onPress={handleClose}
                    aria-label="Close modal"
                  >
                    <X color="$muted" size={28} />
                  </Button>
                </XStack>

                {/* Image Preview */}
                <Stack alignItems="center" gap="$3">
                  <Stack
                    width={200}
                    height={200}
                    borderRadius="$6"
                    overflow="hidden"
                    backgroundColor="$bgCard"
                    position="relative"
                  >
                    {localPreview && (
                      <Image
                        source={{ uri: localPreview }}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                    )}
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
                        <Text color="white" fontSize={14} marginTop="$2">
                          Uploading...
                        </Text>
                      </Stack>
                    )}
                  </Stack>

                  {/* Change Image Buttons */}
                  {!uploading && (
                    <XStack gap="$2">
                      <Button
                        backgroundColor="$bgCard"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$5"
                        height={40}
                        paddingHorizontal="$3"
                        onPress={pickImage}
                        pressStyle={{ opacity: 0.7 }}
                        aria-label="Change image from gallery"
                      >
                        <XStack alignItems="center" gap="$2">
                          <LucideImage color="$color" size={16} />
                          <Text color="$color" fontSize={13} fontWeight="600">
                            Gallery
                          </Text>
                        </XStack>
                      </Button>
                      <Button
                        backgroundColor="$bgCard"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$5"
                        height={40}
                        paddingHorizontal="$3"
                        onPress={takePhoto}
                        pressStyle={{ opacity: 0.7 }}
                        aria-label="Take new photo"
                      >
                        <XStack alignItems="center" gap="$2">
                          <Camera color="$color" size={16} />
                          <Text color="$color" fontSize={13} fontWeight="600">
                            Camera
                          </Text>
                        </XStack>
                      </Button>
                    </XStack>
                  )}
                </Stack>

                {/* Name */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Sticker Name
                  </Text>
                  <Input
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Happy Face, Love, Hug"
                    backgroundColor="$bgCard"
                    borderColor="$borderColor"
                    borderRadius="$5"
                    height={44}
                    fontSize={15}
                    fontFamily="$body"
                    aria-label="Sticker name input"
                  />
                </YStack>

                {/* Description */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Description (Optional)
                  </Text>
                  <Input
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g., For when I miss you..."
                    backgroundColor="$bgCard"
                    borderColor="$borderColor"
                    borderRadius="$5"
                    height={44}
                    fontSize={15}
                    fontFamily="$body"
                    aria-label="Sticker description input"
                  />
                </YStack>

                {/* Save Button */}
                <Button
                  backgroundColor="$primary"
                  borderRadius="$6"
                  height={48}
                  onPress={handleSave}
                  disabled={!name.trim() || !imageUrl || uploading}
                  opacity={!name.trim() || !imageUrl || uploading ? 0.5 : 1}
                  pressStyle={{ opacity: 0.8 }}
                  marginTop="$2"
                  aria-label="Save sticker changes"
                >
                  {uploading ? (
                    <XStack
                      gap="$2"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Spinner size="small" color="white" />
                      <Text color="white" fontWeight="700" fontSize={16}>
                        Uploading...
                      </Text>
                    </XStack>
                  ) : (
                    <Text color="white" fontWeight="700" fontSize={16}>
                      Save Changes
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
