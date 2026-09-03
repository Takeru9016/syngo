import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { TextInput, View, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

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
  { length = 6, group = 3, value = "", onChange, autoFocus, disabled, error },
  _ref,
) {
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
        arr[index] = "";
        const next = Array.from({ length })
          .map((_, i) => arr[i] ?? "")
          .join("");
        onChange?.(next);
      } else if (index > 0) {
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
    <View style={styles.row}>
      {blocks.map((_, i) => {
        const showHyphenAfter = group > 0 && i === group - 1;
        return (
          <React.Fragment key={i}>
            <View style={[styles.slot, !!error && styles.slotError]}>
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
                style={styles.input}
                testID={`code-input-${i}`}
              />
            </View>
            {showHyphenAfter && i < length - 1 ? (
              <Text style={styles.hyphen}>-</Text>
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    width: "100%",
  },
  slot: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  slotError: {
    borderColor: theme.colors.error,
  },
  input: {
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.text,
    padding: 0,
    margin: 0,
    width: "100%",
    textAlign: "center",
  },
  hyphen: {
    fontFamily: theme.typography.fontFamily.ui,
    color: theme.colors.textMuted,
    fontSize: 22,
    fontWeight: "700",
  },
}));
