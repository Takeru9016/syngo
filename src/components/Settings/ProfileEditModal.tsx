import { useEffect, useState } from 'react';
import { Modal, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  TextArea,
  Stack,
  ScrollView,
  Image,
} from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { UserProfile } from '@/types';

type Props = {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSave: (updates: Partial<UserProfile>) => void;
};

export function ProfileEditModal({ visible, profile, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatarUrl);
    }
  }, [profile, visible]);

  const handleSave = () => {
    if (!displayName.trim()) {
      Alert.alert('Missing Name', 'Please enter a display name');
      return;
    }
    onSave({
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatarUrl,
    });
    onClose();
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
      setAvatarUrl(result.assets[0].uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
                    Edit Profile
                  </Text>
                  <Button unstyled onPress={onClose}>
                    <Text color="$muted" fontSize={28}>
                      ✕
                    </Text>
                  </Button>
                </XStack>

                {/* Avatar */}
                <YStack alignItems="center" gap="$3">
                  <Stack
                    width={120}
                    height={120}
                    borderRadius={60}
                    overflow="hidden"
                    backgroundColor="$background"
                  >
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        width="100%"
                        height="100%"
                        resizeMode="cover"
                      />
                    ) : (
                      <Stack
                        width="100%"
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="$primary"
                      >
                        <Text color="white" fontSize={48} fontWeight="900">
                          {displayName.charAt(0).toUpperCase() || '?'}
                        </Text>
                      </Stack>
                    )}
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
                      Change Photo
                    </Text>
                  </Button>
                </YStack>

                {/* Display Name */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Display Name
                  </Text>
                  <Input
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Enter your name"
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderRadius="$5"
                    height={44}
                    fontSize={15}
                  />
                </YStack>

                {/* Bio */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Bio
                  </Text>
                  <TextArea
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell your partner about yourself (optional)"
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderRadius="$5"
                    minHeight={80}
                    fontSize={15}
                  />
                </YStack>

                {/* Save Button */}
                <Button
                  backgroundColor="$primary"
                  borderRadius="$6"
                  height={48}
                  onPress={handleSave}
                  disabled={!displayName.trim()}
                  opacity={!displayName.trim() ? 0.5 : 1}
                  pressStyle={{ opacity: 0.8 }}
                  marginTop="$2"
                >
                  <Text color="white" fontWeight="700" fontSize={16}>
                    Save Changes
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