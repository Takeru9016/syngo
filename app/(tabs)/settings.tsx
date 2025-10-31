import { useEffect, useState } from "react";
import { Alert, Switch, Linking } from "react-native";
import { useColorScheme } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Stack,
  Image,
  Separator,
  Spinner,
} from "tamagui";

import { UserProfile } from "@/types";
import {
  getProfile,
  getPartnerProfile,
  updateProfile,
  uploadAvatar,
} from "@/services/profile/profile.service";
import { ProfileEditModal, ThemeSelectorModal } from "@/components";
import { usePairingStore } from "@/store/pairing";
import { useProfileStore } from "@/store/profile";
import { useThemeStore, ThemeMode } from "@/state/theme";
import { unpair } from "@/services/pairing/pairing.service";

export default function SettingsScreen() {
  // Use profile store for real-time updates
  const storeProfile = useProfileStore((s) => s.profile);
  const storePartner = useProfileStore((s) => s.partnerProfile);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderNotifs, setReminderNotifs] = useState(true);
  const [stickerNotifs, setStickerNotifs] = useState(true);
  const [favoriteNotifs, setFavoriteNotifs] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const systemColorScheme = useColorScheme();
  const { isPaired: isPairedFromStore } = usePairingStore();
  const { mode, setMode } = useThemeStore();

  const load = async () => {
    const [prof, part] = await Promise.all([getProfile(), getPartnerProfile()]);
    setProfile(prof);
    setPartner(part);
  };

  useEffect(() => {
    load();
  }, []);

  // Sync with store (real-time updates)
  useEffect(() => {
    if (storeProfile) {
      setProfile(storeProfile);
    }
  }, [storeProfile]);

  useEffect(() => {
    if (storePartner) {
      setPartner(storePartner);
    }
  }, [storePartner]);

  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    await updateProfile(updates);
    await load();
  };

  const handleChangeAvatar = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your photos.");
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploadingAvatar(true);

      // Upload to Cloudinary (this should update Firestore with Cloudinary URL)
      const avatarUrl = await uploadAvatar(result.assets[0].uri);

      console.log("✅ Avatar uploaded successfully:", avatarUrl);

      // Profile will auto-update via listener, but we can reload to be sure
      await load();

      Alert.alert("Success", "Avatar updated!");
    } catch (error: any) {
      console.error("❌ Avatar upload error:", error);
      Alert.alert("Upload failed", error.message || "Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUnpair = async () => {
    Alert.alert(
      "Unpair",
      "Are you sure you want to unpair? This will remove your connection with your partner.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unpair",
          style: "destructive",
          onPress: async () => {
            try {
              await unpair();
              // Refresh profile
              const updatedProfile = await getProfile();
              if (updatedProfile) {
                setProfile(updatedProfile);
                setPartner(null);
              }
              // Navigate to pair screen
              router.replace("/pair");
            } catch (error: any) {
              console.error("❌ Unpair error:", error);
              Alert.alert("Error", "Failed to unpair. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleOpenNotificationSettings = () => {
    Alert.alert("Notification Settings", "Open system notification settings?", [
      { text: "Cancel", style: "cancel" },
      { text: "Open", onPress: () => Linking.openSettings() },
    ]);
  };

  const handleThemeSelect = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const getThemeLabel = () => {
    if (mode === "system") {
      return `System (${systemColorScheme === "dark" ? "Dark" : "Light"})`;
    }
    return mode === "dark" ? "Dark" : "Light";
  };

  const isPaired = isPairedFromStore;

  return (
    <YStack flex={1} backgroundColor="$bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} padding="$4" paddingTop="$6" gap="$4">
          {/* Header */}
          <Text color="$color" fontSize={28} fontWeight="900">
            Settings
          </Text>

          {/* Profile Section */}
          <YStack gap="$3">
            <Text color="$color" fontSize={18} fontWeight="700">
              Your Profile
            </Text>
            <Stack backgroundColor="$background" borderRadius="$6" padding="$4">
              <XStack gap="$3" alignItems="center">
                {/* Avatar with upload indicator */}
                <Button
                  unstyled
                  onPress={handleChangeAvatar}
                  disabled={uploadingAvatar}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Stack
                    width={60}
                    height={60}
                    borderRadius={30}
                    overflow="hidden"
                    backgroundColor="$primary"
                    position="relative"
                  >
                    {profile?.avatarUrl ? (
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
                        <Text color="white" fontSize={24} fontWeight="900">
                          {profile?.displayName.charAt(0).toUpperCase() || "?"}
                        </Text>
                      </Stack>
                    )}
                    {/* Upload overlay */}
                    {uploadingAvatar && (
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
                        <Spinner color="white" size="small" />
                      </Stack>
                    )}
                  </Stack>
                </Button>
                <YStack flex={1} gap="$1">
                  <Text color="$color" fontSize={16} fontWeight="700">
                    {profile?.displayName || "Loading..."}
                  </Text>
                  {profile?.bio && (
                    <Text color="$muted" fontSize={14} numberOfLines={2}>
                      {profile.bio}
                    </Text>
                  )}
                  {/* Tap to change hint */}
                  <Text color="$muted" fontSize={12} marginTop="$1">
                    Tap avatar to change
                  </Text>
                </YStack>
                <Button
                  backgroundColor="$primary"
                  borderRadius="$5"
                  height={36}
                  paddingHorizontal="$3"
                  onPress={() => setEditModalVisible(true)}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text color="white" fontWeight="600" fontSize={14}>
                    Edit
                  </Text>
                </Button>
              </XStack>
            </Stack>
          </YStack>

          {/* Partner Section */}
          {isPaired && partner && (
            <YStack gap="$3">
              <Text color="$color" fontSize={18} fontWeight="700">
                Partner
              </Text>
              <Stack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$4"
              >
                <XStack gap="$3" alignItems="center">
                  <Stack
                    width={60}
                    height={60}
                    borderRadius={30}
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
                        <Text color="white" fontSize={24} fontWeight="900">
                          {partner.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </Stack>
                    )}
                  </Stack>
                  <YStack flex={1} gap="$1">
                    <Text color="$color" fontSize={16} fontWeight="700">
                      {partner.displayName}
                    </Text>
                    {partner.bio && (
                      <Text color="$muted" fontSize={14} numberOfLines={2}>
                        {partner.bio}
                      </Text>
                    )}
                  </YStack>
                </XStack>
              </Stack>
            </YStack>
          )}

          <Separator borderColor="$borderColor" />

          {/* Notifications Section */}
          <YStack gap="$3">
            <Text color="$color" fontSize={18} fontWeight="700">
              Notifications
            </Text>
            <Stack
              backgroundColor="$background"
              borderRadius="$6"
              padding="$4"
              gap="$3"
            >
              {/* Master Toggle */}
              <XStack alignItems="center" justifyContent="space-between">
                <YStack flex={1} gap="$1">
                  <Text color="$color" fontSize={15} fontWeight="600">
                    Enable Notifications
                  </Text>
                  <Text color="$muted" fontSize={13}>
                    Receive all notifications
                  </Text>
                </YStack>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              </XStack>

              <Separator borderColor="$borderColor" />

              {/* Reminder Notifications */}
              <XStack alignItems="center" justifyContent="space-between">
                <YStack flex={1} gap="$1">
                  <Text color="$color" fontSize={15} fontWeight="600">
                    Reminders
                  </Text>
                  <Text color="$muted" fontSize={13}>
                    Todo and reminder alerts
                  </Text>
                </YStack>
                <Switch
                  value={reminderNotifs}
                  onValueChange={setReminderNotifs}
                  disabled={!notificationsEnabled}
                />
              </XStack>

              <Separator borderColor="$borderColor" />

              {/* Sticker Notifications */}
              <XStack alignItems="center" justifyContent="space-between">
                <YStack flex={1} gap="$1">
                  <Text color="$color" fontSize={15} fontWeight="600">
                    Stickers
                  </Text>
                  <Text color="$muted" fontSize={13}>
                    When partner sends a sticker
                  </Text>
                </YStack>
                <Switch
                  value={stickerNotifs}
                  onValueChange={setStickerNotifs}
                  disabled={!notificationsEnabled}
                />
              </XStack>

              <Separator borderColor="$borderColor" />

              {/* Favorite Notifications */}
              <XStack alignItems="center" justifyContent="space-between">
                <YStack flex={1} gap="$1">
                  <Text color="$color" fontSize={15} fontWeight="600">
                    Favorites
                  </Text>
                  <Text color="$muted" fontSize={13}>
                    When partner adds a favorite
                  </Text>
                </YStack>
                <Switch
                  value={favoriteNotifs}
                  onValueChange={setFavoriteNotifs}
                  disabled={!notificationsEnabled}
                />
              </XStack>

              <Separator borderColor="$borderColor" />

              {/* System Settings */}
              <Button
                backgroundColor="transparent"
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius="$5"
                height={44}
                onPress={handleOpenNotificationSettings}
                pressStyle={{ opacity: 0.7 }}
              >
                <Text color="$color" fontSize={15} fontWeight="600">
                  Open System Settings
                </Text>
              </Button>
            </Stack>
          </YStack>

          <Separator borderColor="$borderColor" />

          {/* Appearance Section */}
          <YStack gap="$3">
            <Text color="$color" fontSize={18} fontWeight="700">
              Appearance
            </Text>
            <Button
              unstyled
              onPress={() => setThemeModalVisible(true)}
              pressStyle={{ opacity: 0.7 }}
            >
              <Stack
                backgroundColor="$background"
                borderRadius="$6"
                padding="$4"
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack flex={1} gap="$1">
                    <Text color="$color" fontSize={15} fontWeight="600">
                      Theme
                    </Text>
                    <Text color="$muted" fontSize={13}>
                      {getThemeLabel()}
                    </Text>
                  </YStack>
                  <Text color="$muted" fontSize={18}>
                    ›
                  </Text>
                </XStack>
              </Stack>
            </Button>
          </YStack>

          <Separator borderColor="$borderColor" />

          {/* Pair Management */}
          <YStack gap="$3">
            <Text color="$color" fontSize={18} fontWeight="700">
              Connection
            </Text>
            <Stack
              backgroundColor="$background"
              borderRadius="$6"
              padding="$4"
              gap="$3"
            >
              <YStack gap="$1">
                <Text color="$color" fontSize={15} fontWeight="600">
                  Pair Status
                </Text>
                <Text color="$muted" fontSize={13}>
                  {isPaired && partner
                    ? `Connected with ${partner.displayName}`
                    : "Not connected"}
                </Text>
              </YStack>
              {isPaired && partner && (
                <>
                  <Separator borderColor="$borderColor" />
                  <Button
                    backgroundColor="transparent"
                    borderColor="#f44336"
                    borderWidth={1}
                    borderRadius="$5"
                    height={44}
                    onPress={handleUnpair}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Text color="#f44336" fontSize={15} fontWeight="600">
                      Disconnect from Partner
                    </Text>
                  </Button>
                </>
              )}
            </Stack>
          </YStack>

          <Separator borderColor="$borderColor" />

          {/* About Section */}
          <YStack gap="$3">
            <Text color="$color" fontSize={18} fontWeight="700">
              About
            </Text>
            <Stack
              backgroundColor="$background"
              borderRadius="$6"
              padding="$4"
              gap="$2"
            >
              <XStack alignItems="center" justifyContent="space-between">
                <Text color="$color" fontSize={15} fontWeight="600">
                  Version
                </Text>
                <Text color="$muted" fontSize={14}>
                  1.0.0
                </Text>
              </XStack>
              <Separator borderColor="$borderColor" />
              <XStack alignItems="center" justifyContent="space-between">
                <Text color="$color" fontSize={15} fontWeight="600">
                  Build
                </Text>
                <Text color="$muted" fontSize={14}>
                  2025.10.26
                </Text>
              </XStack>
            </Stack>
          </YStack>

          {/* Bottom Padding */}
          <Stack height={20} />
        </YStack>
      </ScrollView>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        visible={editModalVisible}
        profile={profile}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveProfile}
      />

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        visible={themeModalVisible}
        currentMode={mode}
        onClose={() => setThemeModalVisible(false)}
        onSelect={handleThemeSelect}
      />
    </YStack>
  );
}
