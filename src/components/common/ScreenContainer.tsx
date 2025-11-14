// components/layout/ScreenContainer.tsx
import { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { YStack, XStack, Text } from "tamagui";

interface ScreenContainerProps {
  title?: string;
  children: ReactNode;
  rightSlot?: ReactNode;
}

export function ScreenContainer({
  title,
  children,
  rightSlot,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <YStack flex={1} backgroundColor="$bg">
      {/* Header */}
      <YStack paddingTop={insets.top} paddingHorizontal="$4" paddingBottom="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Text color="$color" fontSize={28} fontWeight="900">
            {title}
          </Text>
          {rightSlot ? <XStack>{rightSlot}</XStack> : null}
        </XStack>
      </YStack>

      {/* Keyboard-aware scrollable content */}
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={60} // how much EXTRA to scroll when focused
        extraHeight={80} // helps on some Android devices
      >
        <YStack paddingHorizontal="$4" paddingBottom="$6" gap="$5">
          {children}
        </YStack>
      </KeyboardAwareScrollView>
    </YStack>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
});
