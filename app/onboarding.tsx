import { useRouter } from "expo-router";
import { Button, Paragraph, Text, YStack, Theme, Image } from "tamagui";
import { useColorScheme } from "react-native";

import { useThemeStore } from "@/state/theme";
import { useAuthStore } from "@/store/auth";
import { updateUserProfile } from "@/services/profile/profile.service";

export default function OnboardingScreen() {
  const router = useRouter();
  const systemScheme = useColorScheme();
  const { mode, colorScheme } = useThemeStore();

  const effectiveMode =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
  const activeTheme = `${colorScheme}_${effectiveMode}` as const;

  const { user } = useAuthStore();

  const handleGetStarted = async () => {
    try {
      if (user?.uid) {
        console.log("Updating profile for", user.uid);
        await updateUserProfile(user.uid, {
          showOnboardingAfterUnpair: false,
        });
        console.log("✅ Onboarding flag cleared for user:", user.uid);
      } else {
        console.log("⚠️ No user in auth store");
      }

      router.replace("/pair");
    } catch (err) {
      console.warn("⚠️ Failed to update onboarding flag:", err);
      router.replace("/pair");
    }
  };

  return (
    <Theme name={activeTheme}>
      <YStack
        flex={1}
        padding="$5"
        paddingTop="$10"
        backgroundColor="$bg"
        justifyContent="space-between"
      >
        {/* Top brand */}
        <YStack gap="$2">
          <Text
            fontFamily="$heading"
            fontSize={36}
            lineHeight={44}
            color="$color"
          >
            Notify
          </Text>
          <Paragraph fontFamily="$body" size="$3" color="$colorMuted">
            A cozy little space for just the two of you.
          </Paragraph>
        </YStack>

        {/* Hero 3D illustration */}
        <YStack alignItems="center" paddingVertical="$4" gap="$1">
          <Image
            source={require("../assets/illustrations/onboarding-3d-hero.png")}
            style={{
              width: 350, // adjust it
              height: 350, // keep aspect ratio roughly square
            }}
            objectFit="contain"
          />

          <Paragraph
            fontFamily="$body"
            size="$2"
            color="$colorMuted"
            textAlign="center"
            maxWidth={320}
            bottom="$10"
          >
            Tiny reminders, shared todos, and pinned moments that keep you
            gently in sync—without the noise of other apps.
          </Paragraph>
        </YStack>

        {/* Bottom copy + CTA */}
        <YStack gap="$4" marginBottom="$4">
          <YStack gap="$2">
            <Text
              fontFamily="$heading"
              fontSize={24}
              lineHeight={30}
              color="$color"
              textAlign="center"
            >
              Stay close, even on busy days.
            </Text>

            <Paragraph
              fontFamily="$body"
              size="$3"
              color="$colorMuted"
              textAlign="center"
            >
              Set little nudges, track shared tasks, and save moments that
              matter—to both of you.
            </Paragraph>
          </YStack>

          <Button
            backgroundColor="$primary"
            color="white"
            borderRadius="$5"
            size="$5"
            onPress={handleGetStarted}
            fontFamily="$body"
            fontWeight="600"
            height={75}
          >
            Get started together
          </Button>

          <Paragraph
            size="$2"
            color="$colorMuted"
            textAlign="center"
            marginTop="$1"
          >
            You&apos;ll only see this when you&apos;re not paired.
          </Paragraph>
        </YStack>
      </YStack>
    </Theme>
  );
}
