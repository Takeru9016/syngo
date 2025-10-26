import { useState } from 'react';
import { Modal, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Stack,
  ScrollView,
  Image,
} from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, imageUrl: string) => void;
};

export function AddStickerModal({ visible, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleClose = () => {
    setName('');
    setImageUrl(null);
    onClose();
  };

  const handleSave = () => {
    if (!name.trim() || !imageUrl) {
      Alert.alert('Missing Info', 'Please provide a name and select an image');
      return;
    }
    onSave(name.trim(), imageUrl);
    handleClose();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Stack flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
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
              showsVerticalScrollIndicator={true}
            >
              <YStack padding="$4" gap="$4">
                {/* Header */}
                <XStack alignItems="center" justifyContent="space-between">
                  <Text color="$color" fontSize={22} fontWeight="900">
                    New Sticker
                  </Text>
                  <Button unstyled onPress={handleClose}>
                    <Text color="$muted" fontSize={28}>
                      ✕
                    </Text>
                  </Button>
                </XStack>

                {/* Image Preview */}
                {imageUrl ? (
                  <Stack alignItems="center" gap="$3">
                    <Stack
                      width={200}
                      height={200}
                      borderRadius="$6"
                      overflow="hidden"
                      backgroundColor="$background"
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        width="100%"
                        height="100%"
                        resizeMode="cover"
                      />
                    </Stack>
                    <Button
                      backgroundColor="$background"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius="$5"
                      height={40}
                      paddingHorizontal="$4"
                      onPress={pickImage}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Text color="$color" fontSize={14} fontWeight="600">
                        Change Image
                      </Text>
                    </Button>
                  </Stack>
                ) : (
                  <YStack gap="$2">
                    <Text color="$color" fontSize={14} fontWeight="600">
                      Select Image
                    </Text>
                    <XStack gap="$2">
                      <Button
                        flex={1}
                        backgroundColor="$background"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$5"
                        height={100}
                        onPress={pickImage}
                        pressStyle={{ opacity: 0.7 }}
                      >
                        <YStack alignItems="center" gap="$2">
                          <Text fontSize={32}>📷</Text>
                          <Text color="$color" fontSize={14} fontWeight="600">
                            Gallery
                          </Text>
                        </YStack>
                      </Button>
                      <Button
                        flex={1}
                        backgroundColor="$background"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$5"
                        height={100}
                        onPress={takePhoto}
                        pressStyle={{ opacity: 0.7 }}
                      >
                        <YStack alignItems="center" gap="$2">
                          <Text fontSize={32}>📸</Text>
                          <Text color="$color" fontSize={14} fontWeight="600">
                            Camera
                          </Text>
                        </YStack>
                      </Button>
                    </XStack>
                  </YStack>
                )}

                {/* Name */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Sticker Name
                  </Text>
                  <Input
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g., Happy Face, Love, Hug"
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderRadius="$5"
                    height={44}
                    fontSize={15}
                  />
                </YStack>

                {/* Save Button */}
                <Button
                  backgroundColor="$primary"
                  borderRadius="$6"
                  height={48}
                  onPress={handleSave}
                  disabled={!name.trim() || !imageUrl}
                  opacity={!name.trim() || !imageUrl ? 0.5 : 1}
                  pressStyle={{ opacity: 0.8 }}
                  marginTop="$2"
                >
                  <Text color="white" fontWeight="700" fontSize={16}>
                    Add Sticker
                  </Text>
                </Button>
              </YStack>
            </ScrollView>
          </Stack>
        </Stack>
      </KeyboardAvoidingView>
    </Modal>
  );
}