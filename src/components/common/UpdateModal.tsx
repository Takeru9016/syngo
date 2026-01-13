/**
 * UpdateModal Component
 *
 * Non-blocking modal that appears when an OTA update has been downloaded
 * and is ready to apply. User can choose to restart now or later.
 */

import { Modal } from "react-native";
import { YStack, XStack, Text, Button, Stack } from "tamagui";
import { RefreshCw, X, Sparkles } from "@tamagui/lucide-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,

} from "react-native-reanimated";
import { useEffect } from "react";
import { triggerLightHaptic, triggerSuccessHaptic } from "@/state/haptics";

interface UpdateModalProps {
  visible: boolean;
  onRestart: () => void;
  onDismiss: () => void;
  isDownloading?: boolean;
}

export function UpdateModal({
  visible,
  onRestart,
  onDismiss,
  isDownloading = false,
}: UpdateModalProps) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
      triggerLightHaptic();
    } else {
      scale.value = withTiming(0.9, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleRestart = () => {
    triggerSuccessHaptic();
    onRestart();
  };

  const handleDismiss = () => {
    triggerLightHaptic();
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleDismiss}
    >
      <Stack
        flex={1}
        backgroundColor="rgba(0,0,0,0.6)"
        justifyContent="center"
        alignItems="center"
        padding="$5"
      >
        <Animated.View style={animatedStyle}>
          <YStack
            backgroundColor="$bg"
            borderRadius="$8"
            padding="$6"
            width="100%"
            maxWidth={340}
            gap="$5"
            borderWidth={1}
            borderColor="$borderColor"
            shadowColor="black"
            shadowOpacity={0.3}
            shadowRadius={20}
            elevation={10}
          >
            {/* Close Button */}
            <Button
              unstyled
              position="absolute"
              top="$4"
              right="$4"
              width={32}
              height={32}
              borderRadius={16}
              backgroundColor="$bgSoft"
              alignItems="center"
              justifyContent="center"
              onPress={handleDismiss}
              pressStyle={{ opacity: 0.8 }}
              zIndex={10}
            >
              <X size={16} color="$colorMuted" />
            </Button>

            {/* Icon */}
            <YStack alignItems="center" paddingTop="$2">
              <Stack
                width={64}
                height={64}
                borderRadius={32}
                backgroundColor="$primarySoft"
                alignItems="center"
                justifyContent="center"
              >
                <Sparkles size={32} color="$primary" />
              </Stack>
            </YStack>

            {/* Content */}
            <YStack alignItems="center" gap="$2">
              <Text
                fontFamily="$heading"
                fontSize={22}
                fontWeight="800"
                color="$color"
                textAlign="center"
              >
                Update Ready!
              </Text>
              <Text
                fontFamily="$body"
                fontSize={14}
                color="$colorMuted"
                textAlign="center"
                lineHeight={20}
              >
                A new version of Syngo has been downloaded. Restart the app to
                enjoy the latest improvements.
              </Text>
            </YStack>

            {/* Buttons */}
            <YStack gap="$3" paddingTop="$2">
              <Button
                backgroundColor="$primary"
                borderRadius="$6"
                height={48}
                onPress={handleRestart}
                pressStyle={{ opacity: 0.9, scale: 0.98 }}
                disabled={isDownloading}
              >
                <XStack alignItems="center" gap="$2">
                  <RefreshCw
                    size={18}
                    color="white"
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    fontFamily="$body"
                    fontSize={15}
                    fontWeight="700"
                    color="white"
                  >
                    Restart Now
                  </Text>
                </XStack>
              </Button>

              <Button
                unstyled
                height={44}
                alignItems="center"
                justifyContent="center"
                onPress={handleDismiss}
                pressStyle={{ opacity: 0.7 }}
              >
                <Text
                  fontFamily="$body"
                  fontSize={14}
                  fontWeight="600"
                  color="$colorMuted"
                >
                  Maybe Later
                </Text>
              </Button>
            </YStack>
          </YStack>
        </Animated.View>
      </Stack>
    </Modal>
  );
}
