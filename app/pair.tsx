import { useState, useEffect, useMemo } from "react";
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
import { triggerSelectionHaptic } from "@/state/haptics";

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

    const unsubscribe = subscribeToProfile((profile) => {
      if (profile?.pairId) {
        setPairId(profile.pairId);
      } else {
        setPairId(null);
      }
    });

    return () => {
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
    triggerSelectionHaptic();
    await generateCode();
  };

  const handleCopy = async () => {
    if (myCode) {
      triggerSelectionHaptic();
      await Clipboard.setStringAsync(unformatCode(myCode));
      Alert.alert("Copied!", "Code copied to clipboard");
    }
  };

  const handleShare = async () => {
    if (!myCode) return;
    try {
      triggerSelectionHaptic();
      await Share.share({
        message: `Join me on Syngo! Use this code to pair: ${myCode}`,
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


    // Validate input
    if (!cleanInput || cleanInput.length !== 8) {
      Alert.alert("Invalid Code", "Please enter a valid 8-character code.");
      return;
    }

    // Format code (uppercase and clean)
    const formattedCode = unformatCode(input);

    triggerSelectionHaptic();

    // Redeem code
    await redeemCode(formattedCode);
  };

  // Format the displayed code with hyphen
  const displayCode = myCode ? formatCode(unformatCode(myCode)) : "----·----";

  return (
    <ScreenContainer title="Pair with your partner" keyboardOffset={100}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} backgroundColor="$bg">
        <YStack flex={1} padding="$5" paddingTop="$6" gap="$4">
          {/* Subtitle */}
          <Text
            fontFamily="$body"
            color="$colorMuted"
            fontSize={15}
            lineHeight={22}
            marginBottom="$2"
          >
            Pair and start sending cute reminders, stickers, and notes.
          </Text>

          {/* Share Code Card */}
          <Stack
            backgroundColor="$primarySoft"
            borderRadius="$7"
            padding="$5"
            gap="$4"
            borderWidth={1}
            borderColor="$borderColor"
          >
            {/* Title */}
            <Text
              fontFamily="$heading"
              color="$color"
              fontSize={20}
              fontWeight="700"
              lineHeight={26}
            >
              I want to invite my partner
            </Text>

            {/* Code Display */}
            <XStack
              alignItems="center"
              justifyContent="center"
              paddingVertical="$3"
            >
              {isLoading && !myCode ? (
                <Spinner size="large" color="$primary" />
              ) : (
                <Text
                  fontFamily="$body"
                  color="$color"
                  fontSize={38}
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
                height={48}
                onPress={handleCopy}
                disabled={isLoading || codeExpired || !myCode}
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
              >
                {isLoading ? (
                  <Spinner color="white" />
                ) : (
                  <Text
                    fontFamily="$body"
                    color="white"
                    fontWeight="700"
                    fontSize={16}
                  >
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
                height={48}
                onPress={handleShare}
                disabled={isLoading || codeExpired || !myCode}
                pressStyle={{ opacity: 0.7, scale: 0.98 }}
              >
                <Text
                  fontFamily="$body"
                  color="$primary"
                  fontWeight="700"
                  fontSize={16}
                >
                  Share
                </Text>
              </Button>
            </XStack>

            {/* Secure Connection Row */}
            <XStack
              backgroundColor="$bgCard"
              borderRadius="$5"
              padding="$3"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text
                fontFamily="$body"
                color="$color"
                fontSize={15}
                fontWeight="600"
              >
                Secure Connection
              </Text>
              <Switch
                size="$3"
                checked={secure}
                onCheckedChange={(v) => {
                  triggerSelectionHaptic();
                  setSecure(!!v);
                }}
                backgroundColor={secure ? "$primary" : "$borderColor"}
              >
                <Switch.Thumb backgroundColor="white" />
              </Switch>
            </XStack>

            {/* Countdown Row */}
            <XStack
              backgroundColor="$bgSoft"
              borderRadius="$5"
              paddingHorizontal="$3"
              paddingVertical="$2"
              alignItems="center"
              justifyContent="space-between"
              gap="$3"
            >
              <Countdown expiresAt={expiresAt} />

              <Button
                size="$3"
                borderRadius="$6"
                backgroundColor="transparent"
                borderWidth={1}
                borderColor="$primary"
                height={44}
                paddingHorizontal="$3"
                onPress={handleGenerate}
                disabled={isLoading}
                pressStyle={{ opacity: 0.7, scale: 0.97 }}
              >
                {isLoading ? (
                  <Spinner size="small" color="$primary" />
                ) : (
                  <Text
                    fontFamily="$body"
                    color="$primary"
                    fontWeight="700"
                    fontSize={14}
                  >
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
            marginVertical="$3"
          >
            <Separator flex={1} borderColor="$borderColor" />
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$bg"
              borderWidth={1}
              borderColor="$borderColor"
              alignItems="center"
              justifyContent="center"
              marginHorizontal="$3"
            >
              <Text fontFamily="$body" color="$colorMuted" fontSize={14}>
                or
              </Text>
            </Stack>
            <Separator flex={1} borderColor="$borderColor" />
          </XStack>

          {/* Enter Code Card */}
          <Stack
            backgroundColor="$bgCard"
            borderRadius="$7"
            padding="$5"
            gap="$4"
            marginBottom="$4"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text
              fontFamily="$heading"
              color="$color"
              fontSize={20}
              fontWeight="700"
              lineHeight={26}
            >
              I have a code
            </Text>
            <Text fontFamily="$body" color="$colorMuted" fontSize={15}>
              Enter your partner&apos;s code
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
                backgroundColor="$bgSoft"
                borderRadius="$4"
                padding="$3"
                borderWidth={1}
                borderColor="$error"
              >
                <Text
                  fontFamily="$body"
                  color="$error"
                  fontSize={14}
                  fontWeight="600"
                >
                  {error}
                </Text>
              </Stack>
            ) : null}

            <Button
              backgroundColor="$primary"
              borderRadius="$6"
              height={48}
              onPress={handleRedeem}
              disabled={
                isLoading || input.replace(/[^A-Z0-9]/gi, "").length < 8
              }
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
            >
              {isLoading ? (
                <Spinner color="white" />
              ) : (
                <Text
                  fontFamily="$body"
                  color="white"
                  fontWeight="700"
                  fontSize={16}
                >
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
