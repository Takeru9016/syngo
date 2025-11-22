import { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { YStack, XStack, Text } from "tamagui";

interface ScreenContainerProps {
  title?: string;
  children: ReactNode;
  rightSlot?: ReactNode;
  /**
   * Whether ScreenContainer should include its own scroll container.
   * Use scroll={false} on screens that render FlatList / FlashList / SectionList.
   */
  scroll?: boolean;
  /**
   * Whether to use KeyboardAwareScrollView when scroll is true.
   * Mostly useful for forms. Defaults to true.
   */
  keyboardAware?: boolean;
  /**
   * Override horizontal padding for the content section (default is $4).
   */
  contentPaddingHorizontal?: number;
}

export function ScreenContainer({
  title,
  children,
  rightSlot,
  scroll = true,
  keyboardAware = true,
  contentPaddingHorizontal,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  const contentPaddingX =
    contentPaddingHorizontal !== undefined ? contentPaddingHorizontal : 16; // ~$4

  // Header (shared)
  const Header = (
    <YStack
      paddingTop={insets.top}
      paddingHorizontal="$4"
      paddingBottom="$3"
      backgroundColor="$bg"
    >
      <XStack alignItems="center" justifyContent="space-between">
        {title ? (
          <Text
            color="$color"
            fontSize={24}
            fontWeight="800"
            fontFamily="$heading"
          >
            {title}
          </Text>
        ) : (
          <YStack />
        )}
        {rightSlot ? <XStack>{rightSlot}</XStack> : null}
      </XStack>
    </YStack>
  );

  // Non-scroll variant: child components own scrolling (FlatList, etc.)
  if (!scroll) {
    return (
      <YStack flex={1} backgroundColor="$bg">
        {Header}
        <YStack flex={1} paddingHorizontal={contentPaddingX} paddingBottom="$6">
          {children}
        </YStack>
      </YStack>
    );
  }

  // Scroll / keyboard-aware variant for form-style screens
  const ScrollComponent = keyboardAware
    ? KeyboardAwareScrollView
    : (KeyboardAwareScrollView as any); // we’ll configure props similarly for now

  return (
    <YStack flex={1} backgroundColor="$bg">
      {Header}

      <ScrollComponent
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: contentPaddingX, paddingBottom: 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={keyboardAware}
        extraScrollHeight={keyboardAware ? 60 : 0}
        extraHeight={keyboardAware ? 80 : 0}
      >
        {children}
      </ScrollComponent>
    </YStack>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
});
