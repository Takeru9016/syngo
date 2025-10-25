import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { XStack, Stack, Text } from 'tamagui';

type Props = {
  length?: number;
  group?: number;
  value?: string;
  onChange?: (digits: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: string;
};

export const CodeInput = forwardRef<TextInput, Props>(function CodeInput(
  { length = 6, group = 3, value, onChange, autoFocus, disabled, error },
  _ref
) {
  const [digits, setDigits] = useState<string>(value ?? '');
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (value !== undefined && value !== digits) {
      setDigits(value);
    }
  }, [value]);

  const blocks = useMemo(() => Array.from({ length }), [length]);

  const setChar = (index: number, char: string) => {
    const clean = char.replace(/\D/g, '').slice(-1);
    if (!clean) return;
    const arr = digits.split('');
    arr[index] = clean;
    const next = Array.from({ length })
      .map((_, i) => arr[i] ?? '')
      .join('');
    setDigits(next);
    onChange?.(next);

    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      const arr = digits.split('');
      if (arr[index]) {
        arr[index] = '';
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        arr[index - 1] = '';
      }
      const next = Array.from({ length })
        .map((_, i) => arr[i] ?? '')
        .join('');
      setDigits(next);
      onChange?.(next);
    }
  };

  useEffect(() => {
    if (autoFocus) {
      inputs.current[0]?.focus();
    }
  }, [autoFocus]);

  return (
    <XStack alignItems="center" gap="$2" flexWrap="wrap">
      {blocks.map((_, i) => {
        const showHyphenAfter = group > 0 && i === group - 1;
        return (
          <React.Fragment key={i}>
            <Stack
              width={46}
              height={54}
              borderRadius="$4"
              backgroundColor="white"
              borderWidth={2}
              borderColor={error ? '#ff7b7b' : '#e0e0e0'}
              alignItems="center"
              justifyContent="center"
            >
              <TextInput
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                value={digits[i] ?? ''}
                onChangeText={(t) => setChar(i, t)}
                onKeyPress={({ nativeEvent }) => onKeyPress(i, nativeEvent.key)}
                keyboardType="number-pad"
                textAlign="center"
                maxLength={1}
                editable={!disabled}
                style={{
                  fontSize: 22,
                  fontWeight: '900',
                  color: '#2d2751',
                  padding: 0,
                  margin: 0,
                  width: 42,
                  textAlign: 'center',
                }}
              />
            </Stack>
            {showHyphenAfter && i < length - 1 ? (
              <Text color="$muted" fontSize={20} fontWeight="700" marginHorizontal="$1">
                -
              </Text>
            ) : null}
          </React.Fragment>
        );
      })}
    </XStack>
  );
});