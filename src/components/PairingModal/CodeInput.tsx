import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { TextInput } from "react-native";
import { XStack, Stack, Text, useTheme } from "tamagui";

type Props = {
  length?: number;
  group?: number;
  value?: string;
  onChange?: (digits: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: string | null;
};

export const CodeInput = forwardRef<TextInput, Props>(function CodeInput(
  { length = 8, group = 4, value = "", onChange, autoFocus, disabled, error },
  _ref,
) {
  const theme = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);

  const blocks = useMemo(() => Array.from({ length }), [length]);

  const setChar = (index: number, char: string) => {
    const clean = char
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .slice(-1);
    if (!clean) return;

    const arr = value.split("");
    arr[index] = clean;
    const next = Array.from({ length })
      .map((_, i) => arr[i] ?? "")
      .join("");

    onChange?.(next);

    // Auto-advance to next input
    if (clean && index < length - 1) {
      setTimeout(() => {
        inputs.current[index + 1]?.focus();
      }, 10);
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === "Backspace") {
      const arr = value.split("");
      if (arr[index]) {
        // Clear current digit
        arr[index] = "";
        const next = Array.from({ length })
          .map((_, i) => arr[i] ?? "")
          .join("");
        onChange?.(next);
      } else if (index > 0) {
        // Move to previous input and clear it
        setTimeout(() => {
          inputs.current[index - 1]?.focus();
        }, 10);
        arr[index - 1] = "";
        const next = Array.from({ length })
          .map((_, i) => arr[i] ?? "")
          .join("");
        onChange?.(next);
      }
    }
  };

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <XStack alignItems="center" gap="$2" flexWrap="wrap">
      {blocks.map((_, i) => {
        const showHyphenAfter = group > 0 && i === group - 1;
        return (
          <React.Fragment key={i}>
            <Stack
              width={48}
              height={56}
              borderRadius="$4"
              backgroundColor="$bgSoft"
              borderWidth={2}
              borderColor={error ? "$error" : "$borderColor"}
              alignItems="center"
              justifyContent="center"
            >
              <TextInput
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                value={value[i] ?? ""}
                onChangeText={(t) => setChar(i, t)}
                onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
                keyboardType="default"
                autoCapitalize="characters"
                textAlign="center"
                maxLength={1}
                editable={!disabled}
                selectTextOnFocus
                style={{
                  fontSize: 24,
                  fontWeight: "900",
                  color: theme.color.val,
                  padding: 0,
                  margin: 0,
                  width: 44,
                  textAlign: "center",
                }}
              />
            </Stack>
            {showHyphenAfter && i < length - 1 ?
              <Text
                fontFamily="$body"
                color="$colorMuted"
                fontSize={22}
                fontWeight="700"
                marginHorizontal="$1"
              >
                -
              </Text>
            : null}
          </React.Fragment>
        );
      })}
    </XStack>
  );
});
