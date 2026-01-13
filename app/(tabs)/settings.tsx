import { useState } from "react";
import {
  Alert,
  Switch,
  TextInput,
  StyleSheet,
  useColorScheme,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import {
  YStack,
  XStack,
  Text,
  Button,
  Stack,
  Image,
  Spinner,
  useTheme,
  ScrollView,
} from "tamagui";
import {
  User,
  Bell,
  Palette,
  Link2,
  Camera,
  CheckSquare,
  HeartHandshake,
  Sticker,
  Heart,
  ExternalLink,
  Paintbrush,
  ChevronRight,
} from "@tamagui/lucide-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

import { useProfileStore } from "@/store/profile";
import { usePairingStore } from "@/store/pairing";
import {
  useNotificationPreferences,
  NotificationPreferences,
} from "@/store/notificationPreference";
import { useThemeStore, ThemeMode, ColorScheme } from "@/state/theme";
import { ScreenContainer } from "@/components";
import {
  triggerLightHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
} from "@/state/haptics";
import { useToast } from "@/hooks/useToast";

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
      height={44}
      backgroundColor={isActive ? "$primary" : "$bgSoft"}
      borderRadius="$6"
      borderWidth={0}
      onPress={async () => {
        triggerLightHaptic();
        setMode(value);
      }}
      pressStyle={{ opacity: 0.9, scale: 0.97 }}
      overflow="hidden"
    >
      <Text
        fontSize={14}
        fontWeight="700"
        color={isActive ? "white" : "$color"}
        textAlign="center"
      >
        {label}
      </Text>
    </Button>
  );
}

interface AccentChipProps {
  label: string;
  value: ColorScheme;
}

function AccentChip({ label, value }: AccentChipProps) {
  const { colorScheme, setColorScheme } = useThemeStore();
  const isActive = colorScheme === value;

  const background = isActive ? "$primary" : "$bgSoft";
  const borderColor = isActive ? "$primary" : "$borderColor";

  // Map each scheme to a tiny preview color (tune these to your tokens if needed)
  const previewColorMap: Record<ColorScheme, string> = {
    coral: "#FF7A7A",
    rose: "#E86A82",
    plum: "#9A5FB5",
    lavender: "#9C86E0",
    mocha: "#C87A4A",
    ocean: "#1F9A88",
    sunset: "#FF8A5C",
    sky: "#3B82F6",
  };
  const dotColor = previewColorMap[value];

  return (
    <Button
      height={44}
      borderRadius="$8"
      paddingHorizontal="$3"
      backgroundColor={background}
      borderWidth={1}
      borderColor={borderColor}
      onPress={async () => {
        triggerLightHaptic();
        setColorScheme(value);
      }}
      pressStyle={{ opacity: 0.9, scale: 0.97 }}
      overflow="hidden"
    >
      <XStack alignItems="center" gap="$2">
        <Stack
          width={8}
          height={8}
          borderRadius={999}
          backgroundColor={dotColor}
        />
        <Text
          fontSize={12}
          fontWeight="700"
          color={isActive ? "white" : "$color"}
        >
          {label}
        </Text>
      </XStack>
    </Button>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const rnColorScheme = useColorScheme();
  const router = useRouter();
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
  const { success, error: toastError } = useToast();

  const handleChangeAvatar = async () => {
    triggerLightHaptic();

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toastError("Permission Required", "Please grant photo library access");
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
        triggerSuccessHaptic();
        success("Avatar Updated", "Looking great!");
      } catch (err) {
        console.error("Avatar upload failed:", err);
        toastError("Upload Failed", "Could not upload avatar");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      toastError("Invalid Name", "Name cannot be empty");
      return;
    }
    try {
      triggerSuccessHaptic();
      await updateProfile({ displayName: tempName.trim() });
      setEditingName(false);
      success("Name Updated", "Your display name has been changed");
    } catch (err) {
      toastError("Error", "Failed to update name");
    }
  };

  const handleSaveBio = async () => {
    try {
      triggerSuccessHaptic();
      await updateProfile({ bio: tempBio.trim() });
      setEditingBio(false);
      success("Bio Updated", "Your bio has been saved");
    } catch (err) {
      toastError("Error", "Failed to update bio");
    }
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
            triggerWarningHaptic();
            await unpair();
            // No need to call setHasSeenOnboarding - Firestore flag handles it
            // Gate will automatically redirect to /onboarding
          },
        },
      ],
    );
  };

  const handleToggle = async (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    triggerLightHaptic();
    await updatePreferences({ [key]: value });
  };

  const handleResetPreferences = () => {
    Alert.alert(
      "Reset notification preferences",
      "Reset all notification settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            triggerWarningHaptic();
            await resetPreferences();
          },
        },
      ],
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
        theme.color?.val || (rnColorScheme === "dark" ? "#EDEAFB" : "#111111"),
    },
    textarea: {
      backgroundColor: "transparent",
      borderColor: theme.borderColor?.val || "#ccc",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color:
        theme.color?.val || (rnColorScheme === "dark" ? "#EDEAFB" : "#111111"),
      textAlignVertical: "top",
    },
  });

  const switchAccentColor = theme.primary?.val || "#ff8a80";

  return (
    <ScreenContainer keyboardOffset={100} scroll={false}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} padding="$4" paddingTop="$6" gap="$5">
          {/* Top intro */}
          <YStack gap="$1">
            <Text
              color="$color"
              fontSize={18}
              fontFamily="$heading"
              fontWeight="800"
            >
              Settings
            </Text>
            <Text color="$muted" fontSize={13}>
              Tweak your profile, notifications, and theme.
            </Text>
          </YStack>

          {/* Profile Section */}
          <YStack gap="$3">
            <XStack alignItems="center" gap="$2">
              <User size={18} color="$primary" />
              <Text
                color="$color"
                fontSize={15}
                fontFamily="$heading"
                fontWeight="800"
                letterSpacing={0.4}
              >
                Profile
              </Text>
            </XStack>

            {/* Avatar (no big colored background; card itself is soft) */}
            <Stack
              backgroundColor="$bgSoft"
              borderRadius="$7"
              padding="$4"
              alignItems="center"
              gap="$3"
            >
              <Stack position="relative">
                <Stack
                  width={96}
                  height={96}
                  borderRadius="$8"
                  overflow="hidden"
                  backgroundColor="$bg"
                >
                  {uploading ?
                    <Stack
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor="rgba(0,0,0,0.4)"
                    >
                      <Spinner size="large" color="white" />
                    </Stack>
                  : profile?.avatarUrl ?
                    <Image
                      source={{ uri: profile.avatarUrl }}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                  : <Stack
                      width="100%"
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color="$primary" fontSize={40} fontWeight="900">
                        {profile?.displayName.charAt(0).toUpperCase() || "?"}
                      </Text>
                    </Stack>
                  }

                  {/* Soft overlay only when no avatar (subtle gradient feel) */}
                  {!uploading && !profile?.avatarUrl && (
                    <Stack
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      height="45%"
                      backgroundColor="rgba(0,0,0,0.06)"
                    />
                  )}
                </Stack>
                <Stack
                  position="absolute"
                  bottom={-4}
                  right={-4}
                  width={32}
                  height={32}
                  borderRadius="$8"
                  backgroundColor="$primary"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={2}
                  borderColor="$bgSoft"
                >
                  <Camera size={16} color="white" />
                </Stack>
              </Stack>

              <Button
                backgroundColor="$primary"
                borderRadius="$6"
                height={44}
                paddingHorizontal="$5"
                onPress={handleChangeAvatar}
                disabled={uploading}
                pressStyle={{ opacity: 0.9, scale: 0.97 }}
              >
                <Text color="white" fontWeight="700" fontSize={14}>
                  {uploading ? "Uploading..." : "Change avatar"}
                </Text>
              </Button>
            </Stack>

            {/* Display Name */}
            <Stack backgroundColor="$bgSoft" borderRadius="$7" padding="$4">
              <Text
                color="$muted"
                fontSize={11}
                fontWeight="700"
                marginBottom="$2"
                textTransform="uppercase"
              >
                Display Name
              </Text>

              {editingName ?
                <YStack gap="$2">
                  <TextInput
                    value={tempName}
                    onChangeText={setTempName}
                    style={inputStyles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={theme.muted?.val || "#999"}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSaveName}
                  />

                  <XStack gap="$2">
                    <Button
                      flex={1}
                      backgroundColor="$primary"
                      borderRadius="$6"
                      height={44}
                      onPress={handleSaveName}
                      pressStyle={{ opacity: 0.9, scale: 0.97 }}
                    >
                      <Text color="white" fontWeight="700">
                        Save
                      </Text>
                    </Button>

                    <Button
                      flex={1}
                      backgroundColor="$bg"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius="$6"
                      height={44}
                      onPress={() => {
                        setEditingName(false);
                        setTempName(profile?.displayName || "");
                      }}
                      pressStyle={{ opacity: 0.9, scale: 0.97 }}
                    >
                      <Text color="$color" fontWeight="700">
                        Cancel
                      </Text>
                    </Button>
                  </XStack>
                </YStack>
              : <XStack alignItems="center" justifyContent="space-between">
                  <Text color="$color" fontSize={15} fontWeight="600">
                    {profile?.displayName || "Not set"}
                  </Text>

                  <Button
                    backgroundColor="transparent"
                    paddingHorizontal="$2"
                    height={44}
                    onPress={() => {
                      triggerLightHaptic();
                      setTempName(profile?.displayName || "");
                      setEditingName(true);
                    }}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Text color="$primary" fontSize={13} fontWeight="700">
                      Edit
                    </Text>
                  </Button>
                </XStack>
              }
            </Stack>

            {/* Bio */}
            <Stack backgroundColor="$bgSoft" borderRadius="$7" padding="$4">
              <Text
                color="$muted"
                fontSize={11}
                fontWeight="700"
                marginBottom="$2"
                textTransform="uppercase"
              >
                Bio
              </Text>

              {editingBio ?
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
                      borderRadius="$6"
                      height={44}
                      onPress={handleSaveBio}
                      pressStyle={{ opacity: 0.9, scale: 0.97 }}
                    >
                      <Text color="white" fontWeight="700">
                        Save
                      </Text>
                    </Button>

                    <Button
                      flex={1}
                      backgroundColor="$bg"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius="$6"
                      height={44}
                      onPress={() => {
                        setEditingBio(false);
                        setTempBio(profile?.bio || "");
                      }}
                      pressStyle={{ opacity: 0.9, scale: 0.97 }}
                    >
                      <Text color="$color" fontWeight="700">
                        Cancel
                      </Text>
                    </Button>
                  </XStack>
                </YStack>
              : <XStack
                  alignItems="flex-start"
                  justifyContent="space-between"
                  gap="$2"
                >
                  <Text color="$color" fontSize={14} flex={1}>
                    {profile?.bio || "No bio yet"}
                  </Text>

                  <Button
                    backgroundColor="transparent"
                    paddingHorizontal="$2"
                    height={44}
                    onPress={() => {
                      triggerLightHaptic();
                      setTempBio(profile?.bio || "");
                      setEditingBio(true);
                    }}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Text color="$primary" fontSize={13} fontWeight="700">
                      Edit
                    </Text>
                  </Button>
                </XStack>
              }
            </Stack>
          </YStack>

          {/* Appearance Section */}
          <YStack gap="$3">
            <XStack alignItems="center" gap="$2">
              <Palette size={18} color="$primary" />
              <Text
                color="$color"
                fontSize={15}
                fontFamily="$heading"
                fontWeight="800"
                letterSpacing={0.4}
              >
                Appearance
              </Text>
            </XStack>

            {/* Theme mode */}
            <Stack backgroundColor="$bgSoft" borderRadius="$7" padding="$4">
              <Text
                color="$muted"
                fontSize={11}
                fontWeight="700"
                marginBottom="$3"
                textTransform="uppercase"
              >
                Theme mode
              </Text>
              <XStack gap="$2">
                <ThemeOptionButton label="System" value="system" />
                <ThemeOptionButton label="Light" value="light" />
                <ThemeOptionButton label="Dark" value="dark" />
              </XStack>
            </Stack>

            {/* Accent theme */}
            <Stack backgroundColor="$bgSoft" borderRadius="$7" padding="$4">
              <Text
                color="$muted"
                fontSize={11}
                fontWeight="700"
                marginBottom="$3"
                textTransform="uppercase"
              >
                Accent theme
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                <AccentChip label="Coral Sand" value="coral" />
                <AccentChip label="Rose Latte" value="rose" />
                <AccentChip label="Plum Mist" value="plum" />
                <AccentChip label="Lavender Dreams" value="lavender" />
                <AccentChip label="Mocha Haze" value="mocha" />
                <AccentChip label="Ocean Mist" value="ocean" />
                <AccentChip label="Sunset Glow" value="sunset" />
                <AccentChip label="Sky Breeze" value="sky" />
              </XStack>
            </Stack>
          </YStack>

          {/* Notifications Section */}
          <YStack gap="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$2">
                <Bell size={18} color="$primary" />
                <Text
                  color="$color"
                  fontSize={15}
                  fontFamily="$heading"
                  fontWeight="800"
                  letterSpacing={0.4}
                >
                  Notifications
                </Text>
              </XStack>
              <Button
                backgroundColor="transparent"
                padding={0}
                onPress={handleResetPreferences}
                pressStyle={{ opacity: 0.7 }}
              >
                <Text color="$muted" fontSize={12} fontWeight="700">
                  Reset
                </Text>
              </Button>
            </XStack>

            {/* Master Toggle */}
            <ToggleRow
              label="Enable notifications"
              caption="Receive notifications from your partner"
              value={preferences.enabled}
              onToggle={(value) => handleToggle("enabled", value)}
              trackColorActive={switchAccentColor}
              iconLeft={Bell}
            />

            {/* Individual Toggles (only show if enabled) */}
            {preferences.enabled && (
              <>
                <ToggleRow
                  label="Todo reminders"
                  value={preferences.todoReminders}
                  onToggle={(v) => handleToggle("todoReminders", v)}
                  trackColorActive={switchAccentColor}
                  iconLeft={CheckSquare}
                />
                <ToggleRow
                  label="Sticker notifications"
                  value={preferences.stickerNotifications}
                  onToggle={(v) => handleToggle("stickerNotifications", v)}
                  trackColorActive={switchAccentColor}
                  iconLeft={Sticker}
                />
                <ToggleRow
                  label="Favorite updates"
                  value={preferences.favoriteUpdates}
                  onToggle={(v) => handleToggle("favoriteUpdates", v)}
                  trackColorActive={switchAccentColor}
                  iconLeft={Heart}
                />
                <ToggleRow
                  label="Sound"
                  value={preferences.sound}
                  onToggle={(v) => handleToggle("sound", v)}
                  trackColorActive={switchAccentColor}
                />
                <ToggleRow
                  label="Vibration"
                  value={preferences.vibration}
                  onToggle={(v) => handleToggle("vibration", v)}
                  trackColorActive={switchAccentColor}
                />

                {/* Customize Appearance Button */}
                <Button
                  backgroundColor="$bgSoft"
                  borderRadius="$8"
                  height={56}
                  paddingHorizontal="$4"
                  onPress={() => {
                    triggerLightHaptic();
                    router.push("/notification-customization" as any);
                  }}
                  pressStyle={{ opacity: 0.9, scale: 0.98 }}
                >
                  <XStack
                    flex={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <XStack gap="$3" alignItems="center">
                      <Stack
                        width={32}
                        height={32}
                        borderRadius="$5"
                        backgroundColor="$bg"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Paintbrush size={16} color={switchAccentColor} />
                      </Stack>
                      <YStack>
                        <Text color="$color" fontSize={15} fontWeight="600">
                          Customize Appearance
                        </Text>
                        <Text color="$muted" fontSize={12}>
                          Colors, themes & styles
                        </Text>
                      </YStack>
                    </XStack>
                    <ChevronRight size={18} color="$muted" />
                  </XStack>
                </Button>
              </>
            )}
          </YStack>

          {/* Pair Management Section */}
          {partner && (
            <YStack gap="$3" paddingBottom="$6">
              <XStack alignItems="center" gap="$2">
                <Link2 size={18} color="$primary" />
                <Text
                  color="$color"
                  fontSize={15}
                  fontFamily="$heading"
                  fontWeight="800"
                  letterSpacing={0.4}
                >
                  Pair management
                </Text>
              </XStack>

              <Stack backgroundColor="$bgSoft" borderRadius="$7" padding="$4">
                <Text
                  color="$muted"
                  fontSize={11}
                  fontWeight="700"
                  marginBottom="$2"
                  textTransform="uppercase"
                >
                  Connected with
                </Text>
                <XStack gap="$3" alignItems="center">
                  <Stack
                    width={50}
                    height={50}
                    borderRadius={25}
                    overflow="hidden"
                    backgroundColor="$primary"
                  >
                    {partner.avatarUrl ?
                      <Image
                        source={{ uri: partner.avatarUrl }}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                    : <Stack
                        width="100%"
                        height="100%"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color="white" fontSize={20} fontWeight="900">
                          {partner.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </Stack>
                    }
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
                  Unpair device
                </Text>
              </Button>
            </YStack>
          )}

          {/* Account Actions */}
          <YStack gap="$3" paddingBottom="$4">
            <XStack alignItems="center" gap="$2">
              <Text
                color="$color"
                fontSize={15}
                fontFamily="$heading"
                fontWeight="800"
                letterSpacing={0.4}
              >
                Account
              </Text>
            </XStack>

            <Button
              backgroundColor="$bgSoft"
              borderColor="$borderColor"
              borderWidth={1}
              borderRadius="$6"
              height={48}
              onPress={() => {
                Alert.alert(
                  "Delete Account",
                  "Are you sure? This will permanently delete your profile, avatar, and data. This action cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          triggerWarningHaptic();
                          // Import dynamically to avoid circular deps if any, or just use direct import
                          const {
                            deleteAccount,
                          } = require("@/services/profile/profile.service");
                          await deleteAccount();
                          // Auth listener in _layout will handle redirect to onboarding/login
                        } catch (error: any) {
                          Alert.alert("Error", error.message);
                        }
                      },
                    },
                  ],
                );
              }}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="$red10" fontWeight="700" fontSize={15}>
                Delete account
              </Text>
            </Button>
          </YStack>

          {/* About Section */}
          <YStack gap="$3" paddingBottom="$8">
            <XStack alignItems="center" gap="$2">
              <Text
                color="$color"
                fontSize={15}
                fontFamily="$heading"
                fontWeight="800"
                letterSpacing={0.4}
              >
                About
              </Text>
            </XStack>

            <YStack
              backgroundColor="$bgSoft"
              borderRadius="$7"
              overflow="hidden"
            >
              <Button
                backgroundColor="transparent"
                height={48}
                justifyContent="flex-start"
                paddingHorizontal="$4"
                onPress={() => {
                  Linking.openURL("https://syngo.vercel.app/privacy");
                }}
                pressStyle={{ opacity: 0.7, backgroundColor: "$bg" }}
              >
                <XStack justifyContent="space-between" width="100%">
                  <Text color="$color" fontSize={15} fontWeight="600">
                    Privacy Policy
                  </Text>
                  <ExternalLink size={16} color="$muted" />
                </XStack>
              </Button>
              <Stack height={1} backgroundColor="$borderColor" opacity={0.5} />
              <Button
                backgroundColor="transparent"
                height={48}
                justifyContent="flex-start"
                paddingHorizontal="$4"
                onPress={() => {
                  Linking.openURL("https://syngo.vercel.app/terms");
                }}
                pressStyle={{ opacity: 0.7, backgroundColor: "$bg" }}
              >
                <XStack justifyContent="space-between" width="100%">
                  <Text color="$color" fontSize={15} fontWeight="600">
                    Terms of Service (EULA)
                  </Text>
                  <ExternalLink size={16} color="$muted" />
                </XStack>
              </Button>
            </YStack>

            <Text
              textAlign="center"
              color="$muted"
              fontSize={12}
              marginTop="$2"
            >
              Version {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}

type ToggleRowProps = {
  label: string;
  caption?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  trackColorActive: string;
  iconLeft?: React.ComponentType<{ size?: number; color?: string }>;
};

function ToggleRow({
  label,
  caption,
  value,
  onToggle,
  trackColorActive,
  iconLeft: IconLeft,
}: ToggleRowProps) {
  return (
    <XStack
      backgroundColor="$bgSoft"
      borderRadius="$8"
      paddingVertical="$3"
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
    >
      <XStack flex={1} gap="$2" alignItems="center">
        {IconLeft && (
          <Stack
            width={26}
            height={26}
            borderRadius="$8"
            backgroundColor="$bg"
            alignItems="center"
            justifyContent="center"
          >
            <IconLeft size={14} color={trackColorActive} />
          </Stack>
        )}
        <YStack flex={1} gap="$1">
          <Text color="$color" fontSize={15} fontWeight="600">
            {label}
          </Text>
          {caption && (
            <Text color="$muted" fontSize={12}>
              {caption}
            </Text>
          )}
        </YStack>
      </XStack>
      <Switch
        value={value}
        onValueChange={(val) => {
          onToggle(val);
        }}
        trackColor={{
          false: "#99999940",
          true: trackColorActive,
        }}
        thumbColor={"#ffffff"}
      />
    </XStack>
  );
}
