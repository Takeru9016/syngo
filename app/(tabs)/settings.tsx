import { useState } from "react";
import {
  Alert,
  Switch,
  ScrollView,
  TextInput,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import {
  YStack,
  XStack,
  Text,
  Button,
  Stack,
  Image,
  Spinner,
  useTheme,
} from "tamagui";

import { useProfileStore } from "@/store/profile";
import { usePairingStore } from "@/store/pairing";
import {
  useNotificationPreferences,
  NotificationPreferences,
} from "@/store/notificationPreference";
import { useThemeStore } from "@/state/theme";
import { ScreenContainer } from "@/components";

type ThemeMode = "system" | "light" | "dark";

interface ThemeOptionButtonProps {
  label: string;
  value: ThemeMode;
}

function ThemeOptionButton({ label, value }: ThemeOptionButtonProps) {
  const { mode, setMode } = useThemeStore();
  const isActive = mode === value;

  return (
    <Button
      flex={1}
      height={40}
      backgroundColor={isActive ? "$primary" : "$backgroundStrong"}
      borderRadius="$5"
      borderWidth={isActive ? 0 : 1}
      borderColor="$borderColor"
      onPress={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setMode(value);
      }}
      pressStyle={{ opacity: 0.85 }}
    >
      <Text
        fontSize={14}
        fontWeight="600"
        color={isActive ? "white" : "$color"}
        textAlign="center"
      >
        {label}
      </Text>
    </Button>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const profile = useProfileStore((s) => s.profile);
  const partner = useProfileStore((s) => s.partnerProfile);
  const updateProfile = useProfileStore((s) => s.updateProfileData);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);
  const unpair = usePairingStore((s) => s.unpair);

  const { preferences, updatePreferences, resetPreferences } =
    useNotificationPreferences();

  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [tempName, setTempName] = useState(profile?.displayName || "");
  const [tempBio, setTempBio] = useState(profile?.bio || "");
  const [uploading, setUploading] = useState(false);

  const handleChangeAvatar = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant photo library access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        await uploadAvatar(result.assets[0].uri);
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (error) {
        console.error("Avatar upload failed:", error);
        Alert.alert("Upload Failed", "Could not upload avatar");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      Alert.alert("Invalid Name", "Name cannot be empty");
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateProfile({ displayName: tempName.trim() });
    setEditingName(false);
  };

  const handleSaveBio = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateProfile({ bio: tempBio.trim() });
    setEditingBio(false);
  };

  const handleUnpair = () => {
    Alert.alert(
      "Unpair Device",
      `Are you sure you want to unpair from ${
        partner?.displayName || "your partner"
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unpair",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
            await unpair();
            router.replace("/pair");
          },
        },
      ]
    );
  };

  const handleToggle = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updatePreferences({ [key]: value });
  };

  const handleResetPreferences = () => {
    Alert.alert(
      "Reset Notification Preferences",
      "Are you sure you want to reset all notification settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
            await resetPreferences();
          },
        },
      ]
    );
  };

  // Dynamic styles based on theme
  const inputStyles = StyleSheet.create({
    input: {
      backgroundColor: "transparent",
      borderColor: theme.borderColor?.val || "#ccc",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color:
        theme.color?.val || (colorScheme === "dark" ? "#EDEAFB" : "#111111"),
    },
    textarea: {
      backgroundColor: "transparent",
      borderColor: theme.borderColor?.val || "#ccc",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color:
        theme.color?.val || (colorScheme === "dark" ? "#EDEAFB" : "#111111"),
      textAlignVertical: "top",
    },
  });

  return (
    <ScreenContainer title="Settings">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <YStack flex={1} padding="$4" paddingTop="$6" gap="$5">
            {/* Profile Section */}
            <YStack gap="$3">
              <Text color="$color" fontSize={18} fontWeight="700">
                Profile
              </Text>

              {/* Avatar */}
              <Stack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$4"
                alignItems="center"
                gap="$3"
              >
                <Stack
                  width={100}
                  height={100}
                  borderRadius={50}
                  overflow="hidden"
                  backgroundColor="$primary"
                  position="relative"
                >
                  {uploading ? (
                    <Stack
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor="rgba(0,0,0,0.5)"
                    >
                      <Spinner size="large" color="white" />
                    </Stack>
                  ) : profile?.avatarUrl ? (
                    <Image
                      source={{ uri: profile.avatarUrl }}
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
                    >
                      <Text color="white" fontSize={40} fontWeight="900">
                        {profile?.displayName.charAt(0).toUpperCase() || "?"}
                      </Text>
                    </Stack>
                  )}
                </Stack>
                <Button
                  backgroundColor="$primary"
                  borderRadius="$5"
                  height={40}
                  paddingHorizontal="$4"
                  onPress={handleChangeAvatar}
                  disabled={uploading}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text color="white" fontWeight="600" fontSize={14}>
                    {uploading ? "Uploading..." : "Change Avatar"}
                  </Text>
                </Button>
              </Stack>

              {/* Display Name */}
              <Stack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$4"
              >
                <Text
                  color="$muted"
                  fontSize={12}
                  fontWeight="600"
                  marginBottom="$2"
                >
                  DISPLAY NAME
                </Text>
                {editingName ? (
                  <YStack gap="$2">
                    <TextInput
                      value={tempName}
                      onChangeText={setTempName}
                      style={inputStyles.input}
                      placeholder="Enter your name"
                      placeholderTextColor={theme.muted?.val || "#999"}
                    />
                    <XStack gap="$2">
                      <Button
                        flex={1}
                        backgroundColor="$primary"
                        borderRadius="$5"
                        height={40}
                        onPress={handleSaveName}
                        pressStyle={{ opacity: 0.8 }}
                      >
                        <Text color="white" fontWeight="600">
                          Save
                        </Text>
                      </Button>
                      <Button
                        flex={1}
                        backgroundColor="transparent"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$5"
                        height={40}
                        onPress={() => {
                          setEditingName(false);
                          setTempName(profile?.displayName || "");
                        }}
                        pressStyle={{ opacity: 0.7 }}
                      >
                        <Text color="$color" fontWeight="600">
                          Cancel
                        </Text>
                      </Button>
                    </XStack>
                  </YStack>
                ) : (
                  <XStack alignItems="center" justifyContent="space-between">
                    <Text color="$color" fontSize={16} fontWeight="600">
                      {profile?.displayName || "Not set"}
                    </Text>
                    <Button
                      backgroundColor="transparent"
                      padding={0}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setEditingName(true);
                      }}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Text color="$primary" fontSize={14} fontWeight="600">
                        Edit
                      </Text>
                    </Button>
                  </XStack>
                )}
              </Stack>

              {/* Bio */}
              <Stack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$4"
              >
                <Text
                  color="$muted"
                  fontSize={12}
                  fontWeight="600"
                  marginBottom="$2"
                >
                  BIO
                </Text>
                {editingBio ? (
                  <YStack gap="$2">
                    <TextInput
                      value={tempBio}
                      onChangeText={setTempBio}
                      style={inputStyles.textarea}
                      placeholder="Tell us about yourself"
                      placeholderTextColor={theme.muted?.val || "#999"}
                      multiline
                      numberOfLines={3}
                    />
                    <XStack gap="$2">
                      <Button
                        flex={1}
                        backgroundColor="$primary"
                        borderRadius="$5"
                        height={40}
                        onPress={handleSaveBio}
                        pressStyle={{ opacity: 0.8 }}
                      >
                        <Text color="white" fontWeight="600">
                          Save
                        </Text>
                      </Button>
                      <Button
                        flex={1}
                        backgroundColor="transparent"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$5"
                        height={40}
                        onPress={() => {
                          setEditingBio(false);
                          setTempBio(profile?.bio || "");
                        }}
                        pressStyle={{ opacity: 0.7 }}
                      >
                        <Text color="$color" fontWeight="600">
                          Cancel
                        </Text>
                      </Button>
                    </XStack>
                  </YStack>
                ) : (
                  <XStack
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Text color="$color" fontSize={15} flex={1}>
                      {profile?.bio || "No bio yet"}
                    </Text>
                    <Button
                      backgroundColor="transparent"
                      padding={0}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setEditingBio(true);
                      }}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Text color="$primary" fontSize={14} fontWeight="600">
                        Edit
                      </Text>
                    </Button>
                  </XStack>
                )}
              </Stack>
            </YStack>
            {/* Notifications Section */}
            <YStack gap="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <Text color="$color" fontSize={18} fontWeight="700">
                  Notifications
                </Text>
                <Button
                  backgroundColor="transparent"
                  padding={0}
                  onPress={handleResetPreferences}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text color="$muted" fontSize={13} fontWeight="600">
                    Reset
                  </Text>
                </Button>
              </XStack>

              {/* Master Toggle */}
              <XStack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$4"
                alignItems="center"
                justifyContent="space-between"
              >
                <YStack flex={1}>
                  <Text color="$color" fontSize={15} fontWeight="600">
                    Enable Notifications
                  </Text>
                  <Text color="$muted" fontSize={13}>
                    Receive notifications from your partner
                  </Text>
                </YStack>
                <Switch
                  value={preferences.enabled}
                  onValueChange={(value) => handleToggle("enabled", value)}
                  trackColor={{ false: "#ccc", true: "#007AFF" }}
                />
              </XStack>

              {/* Individual Toggles (only show if enabled) */}
              {preferences.enabled && (
                <>
                  <XStack
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text color="$color" fontSize={15} fontWeight="600">
                      Todo Reminders
                    </Text>
                    <Switch
                      value={preferences.todoReminders}
                      onValueChange={(value) =>
                        handleToggle("todoReminders", value)
                      }
                      trackColor={{ false: "#ccc", true: "#007AFF" }}
                    />
                  </XStack>

                  <XStack
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text color="$color" fontSize={15} fontWeight="600">
                      Sticker Notifications
                    </Text>
                    <Switch
                      value={preferences.stickerNotifications}
                      onValueChange={(value) =>
                        handleToggle("stickerNotifications", value)
                      }
                      trackColor={{ false: "#ccc", true: "#007AFF" }}
                    />
                  </XStack>

                  <XStack
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text color="$color" fontSize={15} fontWeight="600">
                      Favorite Updates
                    </Text>
                    <Switch
                      value={preferences.favoriteUpdates}
                      onValueChange={(value) =>
                        handleToggle("favoriteUpdates", value)
                      }
                      trackColor={{ false: "#ccc", true: "#007AFF" }}
                    />
                  </XStack>

                  <XStack
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text color="$color" fontSize={15} fontWeight="600">
                      Pair Events
                    </Text>
                    <Switch
                      value={preferences.pairEvents}
                      onValueChange={(value) =>
                        handleToggle("pairEvents", value)
                      }
                      trackColor={{ false: "#ccc", true: "#007AFF" }}
                    />
                  </XStack>

                  <XStack
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text color="$color" fontSize={15} fontWeight="600">
                      Sound
                    </Text>
                    <Switch
                      value={preferences.sound}
                      onValueChange={(value) => handleToggle("sound", value)}
                      trackColor={{ false: "#ccc", true: "#007AFF" }}
                    />
                  </XStack>

                  <XStack
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text color="$color" fontSize={15} fontWeight="600">
                      Vibration
                    </Text>
                    <Switch
                      value={preferences.vibration}
                      onValueChange={(value) =>
                        handleToggle("vibration", value)
                      }
                      trackColor={{ false: "#ccc", true: "#007AFF" }}
                    />
                  </XStack>
                </>
              )}
            </YStack>

            {/* Theme Section */}
            <YStack gap="$3">
              <Text color="$color" fontSize={18} fontWeight="700">
                Appearance
              </Text>

              <Stack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$4"
              >
                <Text
                  color="$muted"
                  fontSize={12}
                  fontWeight="600"
                  marginBottom="$3"
                >
                  THEME
                </Text>

                <XStack gap="$2">
                  <ThemeOptionButton label="System" value="system" />
                  <ThemeOptionButton label="Light" value="light" />
                  <ThemeOptionButton label="Dark" value="dark" />
                </XStack>
              </Stack>
            </YStack>
            {/* Pair Management Section */}
            {partner && (
              <YStack gap="$3">
                <Text color="$color" fontSize={18} fontWeight="700">
                  Pair Management
                </Text>

                <Stack
                  backgroundColor="$background"
                  borderRadius="$6"
                  padding="$4"
                >
                  <Text
                    color="$muted"
                    fontSize={12}
                    fontWeight="600"
                    marginBottom="$2"
                  >
                    CONNECTED WITH
                  </Text>
                  <XStack gap="$3" alignItems="center">
                    <Stack
                      width={50}
                      height={50}
                      borderRadius={25}
                      overflow="hidden"
                      backgroundColor="$primary"
                    >
                      {partner.avatarUrl ? (
                        <Image
                          source={{ uri: partner.avatarUrl }}
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
                        >
                          <Text color="white" fontSize={20} fontWeight="900">
                            {partner.displayName.charAt(0).toUpperCase()}
                          </Text>
                        </Stack>
                      )}
                    </Stack>
                    <YStack flex={1}>
                      <Text color="$color" fontSize={16} fontWeight="600">
                        {partner.displayName}
                      </Text>
                      {partner.bio && (
                        <Text color="$muted" fontSize={13} numberOfLines={1}>
                          {partner.bio}
                        </Text>
                      )}
                    </YStack>
                  </XStack>
                </Stack>

                <Button
                  backgroundColor="#f44336"
                  borderRadius="$6"
                  height={48}
                  onPress={handleUnpair}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text color="white" fontWeight="700" fontSize={15}>
                    Unpair Device
                  </Text>
                </Button>
              </YStack>
            )}
          </YStack>
        </ScrollView>
    </ScreenContainer>
  );
}
