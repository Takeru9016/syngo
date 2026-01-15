import { useState } from "react";
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
import { Image as LucideImage, Camera, X } from "@tamagui/lucide-icons";

import { CloudinaryStorage } from "@/services/storage/cloudinary.adapter";
import { useToast } from "@/hooks/useToast";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, imageUrl: string, description?: string) => void;
};

export function AddStickerModal({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { success, error: toastError, info } = useToast();

  const handleClose = () => {
    setName("");
    setDescription("");
    setImageUrl(null);
    setLocalPreview(null);
    onClose();
  };

  const handleSave = () => {
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

    onSave(name.trim(), imageUrl, description.trim() || undefined);
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
      success("Image Uploaded", "Ready to add sticker!");
    } catch (err) {
      console.error("Upload failed:", err);
      toastError("Upload Failed", "Could not upload image. Please try again.");
      setLocalPreview(null);
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

  const removeImage = () => {
    setImageUrl(null);
    setLocalPreview(null);
  };

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
                  <Text
                    fontFamily="$heading"
                    color="$color"
                    fontSize={22}
                    fontWeight="900"
                  >
                    New Sticker
                  </Text>
                  <Button
                    unstyled
                    onPress={handleClose}
                    aria-label="Close modal"
                  >
                    <X color="$muted" size={28} />
                  </Button>
                </XStack>

                {/* Image Preview */}
                {localPreview ?
                  <Stack alignItems="center" gap="$3">
                    <Stack
                      width={200}
                      height={200}
                      borderRadius="$6"
                      overflow="hidden"
                      backgroundColor="$bgCard"
                      position="relative"
                    >
                      <Image
                        source={{ uri: localPreview }}
                        width="100%"
                        height="100%"
                        objectFit="cover"
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
                          <Text color="white" fontSize={14} marginTop="$2">
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
                          borderRadius="$7"
                          width={32}
                          height={32}
                          padding={0}
                          onPress={removeImage}
                          pressStyle={{ opacity: 0.8 }}
                          aria-label="Remove image"
                        >
                          <X color="white" size={18} />
                        </Button>
                      )}
                    </Stack>
                    {!uploading && (
                      <Button
                        backgroundColor="$bgCard"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$5"
                        height={40}
                        paddingHorizontal="$4"
                        onPress={pickImage}
                        pressStyle={{ opacity: 0.7 }}
                        aria-label="Change image"
                      >
                        <YStack
                          alignItems="center"
                          gap="$2"
                          flexDirection="row"
                          justifyContent="center"
                        >
                          <LucideImage color="$color" size={18} />
                          <Text color="$color" fontSize={14} fontWeight="600">
                            Change Image
                          </Text>
                        </YStack>
                      </Button>
                    )}
                  </Stack>
                : <YStack gap="$2">
                    <Text color="$color" fontSize={14} fontWeight="600">
                      Select Image
                    </Text>
                    <XStack gap="$2">
                      <Button
                        flex={1}
                        backgroundColor="$bgCard"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$5"
                        height={100}
                        onPress={pickImage}
                        disabled={uploading}
                        opacity={uploading ? 0.5 : 1}
                        pressStyle={{ opacity: 0.7 }}
                        aria-label="Pick image from gallery"
                      >
                        <YStack alignItems="center" gap="$2">
                          {uploading ?
                            <Spinner size="small" />
                          : <LucideImage color="$color" size={32} />}
                          <Text color="$color" fontSize={14} fontWeight="600">
                            Gallery
                          </Text>
                        </YStack>
                      </Button>
                      <Button
                        flex={1}
                        backgroundColor="$bgCard"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$5"
                        height={100}
                        onPress={takePhoto}
                        disabled={uploading}
                        opacity={uploading ? 0.5 : 1}
                        pressStyle={{ opacity: 0.7 }}
                        aria-label="Take photo with camera"
                      >
                        <YStack alignItems="center" gap="$2">
                          {uploading ?
                            <Spinner size="small" />
                          : <Camera color="$color" size={32} />}
                          <Text color="$color" fontSize={14} fontWeight="600">
                            Camera
                          </Text>
                        </YStack>
                      </Button>
                    </XStack>
                  </YStack>
                }

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
                  aria-label="Save sticker"
                >
                  {uploading ?
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
                  : <Text color="white" fontWeight="700" fontSize={16}>
                      Add Sticker
                    </Text>
                  }
                </Button>
              </YStack>
            </ScrollView>
          </Stack>
        </Stack>
      </KeyboardAvoidingView>
    </Modal>
  );
}
