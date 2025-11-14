import { useEffect, useMemo, useState } from "react";
import { Share, Alert } from "react-native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  YStack,
  XStack,
  Stack,
  Text,
  Button,
  Separator,
  Switch,
  ScrollView,
  Spinner,
} from "tamagui";

import { CodeInput, Countdown, ScreenContainer } from "@/components";
import { usePairingStore } from "@/store/pairing";
import { formatCode, unformatCode } from "@/utils/code-generator";
import { subscribeToProfile } from "@/services/profile/profile.service";

export default function PairScreen() {
  const {
    isPaired,
    pairId,
    code: myCode,
    expiresAt,
    isLoading,
    error,
    generateCode,
    redeemCode,
    checkExistingCode,
    setPairId,
    clearError,
  } = usePairingStore();

  const [input, setInput] = useState<string>("");
  const [secure, setSecure] = useState<boolean>(true);

  // Listen for profile changes (pairing updates)
  useEffect(() => {
    console.log("👂 Setting up profile listener...");

    const unsubscribe = subscribeToProfile((profile) => {
      if (profile?.pairId) {
        console.log("🎉 Pair detected! pairId:", profile.pairId);
        setPairId(profile.pairId);
      } else {
        setPairId(null);
      }
    });

    return () => {
      console.log("🔇 Cleaning up profile listener");
      unsubscribe();
    };
  }, [setPairId]);

  // Check for existing code on mount
  useEffect(() => {
    if (!myCode || !expiresAt) {
      checkExistingCode().then((hasCode) => {
        if (!hasCode) {
          handleGenerate();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect if paired
  useEffect(() => {
    if (isPaired && pairId) {
      console.log("✅ Paired! Redirecting to home...");
      router.replace("/(tabs)");
    }
  }, [isPaired, pairId]);

  // Clear error when input changes
  const handleInputChange = (newValue: string) => {
    setInput(newValue);
    if (error) {
      clearError();
    }
  };

  const handleGenerate = async () => {
    await generateCode();
  };

  const handleCopy = async () => {
    if (myCode) {
      await Clipboard.setStringAsync(unformatCode(myCode));
      Alert.alert("Copied!", "Code copied to clipboard");
    }
  };

  const handleShare = async () => {
    if (!myCode) return;
    try {
      await Share.share({
        message: `Join me on Notify! Use this code to pair: ${myCode}`,
      });
    } catch (error) {
      console.error("Error sharing code:", error);
    }
  };

  const codeExpired = useMemo(() => {
    return !!expiresAt && Date.now() > expiresAt;
  }, [expiresAt]);

  const handleRedeem = async () => {
    // Clean the input (remove non-alphanumeric)
    const cleanInput = input.replace(/[^A-Z0-9]/gi, "");

    console.log("🔍 Input:", input);
    console.log("🔍 Clean input:", cleanInput);
    console.log("🔍 Length:", cleanInput.length);

    // Validate input
    if (!cleanInput || cleanInput.length !== 8) {
      Alert.alert("Invalid Code", "Please enter a valid 8-character code.");
      return;
    }

    // Format code (uppercase and clean)
    const formattedCode = unformatCode(input);
    console.log("🚀 Redeeming code:", formattedCode);

    // Redeem code
    await redeemCode(formattedCode);
  };

  // Format the displayed code with hyphen
  const displayCode = myCode ? formatCode(unformatCode(myCode)) : "----·----";

  return (
    <ScreenContainer title="Pair with your partner">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$bg">
        <YStack flex={1} padding="$4" paddingTop="$6" gap="$3">

          <Text color="$muted" fontSize={14} marginBottom="$2" lineHeight={20}>
            Pair and start sending cute reminders, stickers, and notes.
          </Text>

          {/* Share Code Card */}
          <Stack
            backgroundColor="#e9d7ff"
            borderRadius="$7"
            padding="$4"
            gap="$3"
          >
            {/* Title + Badge */}
            <XStack
              alignItems="flex-start"
              justifyContent="space-between"
              gap="$2"
            >
              <Text
                color="$color"
                fontSize={18}
                fontWeight="900"
                flex={1}
                lineHeight={22}
              >
                I want to invite my partner
              </Text>
            </XStack>

            {/* Code Display */}
            <XStack
              alignItems="center"
              justifyContent="center"
              paddingVertical="$2"
            >
              {isLoading && !myCode ? (
                <Spinner size="large" color="$primary" />
              ) : (
                <Text
                  color="$color"
                  fontSize={36}
                  fontWeight="900"
                  letterSpacing={4}
                >
                  {displayCode}
                </Text>
              )}
            </XStack>

            {/* Copy + Share Buttons */}
            <XStack gap="$3">
              <Button
                flex={1}
                backgroundColor="$primary"
                borderRadius="$6"
                height={44}
                onPress={handleCopy}
                disabled={isLoading || codeExpired || !myCode}
                pressStyle={{ opacity: 0.8 }}
              >
                {isLoading ? (
                  <Spinner color="white" />
                ) : (
                  <Text color="white" fontWeight="700" fontSize={15}>
                    Copy
                  </Text>
                )}
              </Button>
              <Button
                flex={1}
                backgroundColor="transparent"
                borderWidth={2}
                borderColor="$primary"
                borderRadius="$6"
                height={44}
                onPress={handleShare}
                disabled={isLoading || codeExpired || !myCode}
                pressStyle={{ opacity: 0.7 }}
              >
                <Text color="$primary" fontWeight="700" fontSize={15}>
                  Share
                </Text>
              </Button>
            </XStack>

            {/* Secure Connection Row */}
            <XStack
              backgroundColor="rgba(255,255,255,0.5)"
              borderRadius="$5"
              padding="$3"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text color="$color" fontSize={14} fontWeight="600">
                Secure Connection
              </Text>
              <Switch
                size="$3"
                checked={secure}
                onCheckedChange={(v) => setSecure(!!v)}
                backgroundColor={secure ? "$primary" : "$borderColor"}
              >
                <Switch.Thumb backgroundColor="white" />
              </Switch>
            </XStack>

            {/* Countdown Row */}
            <XStack
              backgroundColor="rgba(255,255,255,0.3)"
              borderRadius="$5"
              padding="$3"
              alignItems="center"
              justifyContent="space-between"
            >
              <Countdown expiresAt={expiresAt} />
              <Button
                chromeless
                onPress={handleGenerate}
                disabled={isLoading}
                pressStyle={{ opacity: 0.6 }}
              >
                {isLoading ? (
                  <Spinner size="small" color="$primary" />
                ) : (
                  <Text color="$primary" fontWeight="700" fontSize={14}>
                    Regenerate
                  </Text>
                )}
              </Button>
            </XStack>
          </Stack>

          {/* Divider "or" */}
          <XStack
            alignItems="center"
            justifyContent="center"
            marginVertical="$2"
          >
            <Separator flex={1} borderColor="$borderColor" />
            <Stack
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$borderColor"
              alignItems="center"
              justifyContent="center"
              marginHorizontal="$3"
            >
              <Text color="$muted" fontSize={13}>
                or
              </Text>
            </Stack>
            <Separator flex={1} borderColor="$borderColor" />
          </XStack>

          {/* Enter Code Card */}
          <Stack
            backgroundColor="#ffd0c8"
            borderRadius="$7"
            padding="$4"
            gap="$3"
            marginBottom="$4"
          >
            <Text color="$color" fontSize={18} fontWeight="900" lineHeight={22}>
              I have a code
            </Text>
            <Text color="$muted" fontSize={14}>
              Enter your partner's code
            </Text>

            <CodeInput
              length={8}
              group={4}
              value={input}
              onChange={handleInputChange}
              error={error}
            />

            {error ? (
              <Stack
                backgroundColor="rgba(255,255,255,0.7)"
                borderRadius="$4"
                padding="$2"
              >
                <Text color="#d32f2f" fontSize={13} fontWeight="600">
                  {error}
                </Text>
              </Stack>
            ) : null}

            <Button
              backgroundColor="$primary"
              borderRadius="$6"
              height={44}
              onPress={handleRedeem}
              disabled={
                isLoading || input.replace(/[^A-Z0-9]/gi, "").length < 8
              }
              pressStyle={{ opacity: 0.8 }}
            >
              {isLoading ? (
                <Spinner color="white" />
              ) : (
                <Text color="white" fontWeight="700" fontSize={15}>
                  Pair now
                </Text>
              )}
            </Button>
          </Stack>
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}
