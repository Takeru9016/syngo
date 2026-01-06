import { useState, useCallback } from "react";
import { Pressable } from "react-native";
import { XStack, Text, Stack } from "tamagui";

import { MoodLevel, MOOD_EMOJIS, MOOD_LABELS } from "@/types";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/state/haptics";

type Props = {
  value?: MoodLevel;
  onChange: (level: MoodLevel) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
};

const MOOD_LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

export function MoodPicker({ value, onChange, disabled, size = "md" }: Props) {
  const [pressedLevel, setPressedLevel] = useState<MoodLevel | null>(null);

  const sizeConfig = {
    sm: { buttonSize: 40, fontSize: 20, gap: "$2" as const },
    md: { buttonSize: 52, fontSize: 26, gap: "$2" as const },
    lg: { buttonSize: 56, fontSize: 30, gap: "$2" as const },
  }[size];

  const handleSelect = useCallback(
    (level: MoodLevel) => {
      if (disabled) return;
      triggerSuccessHaptic();
      onChange(level);
    },
    [disabled, onChange]
  );

  const handlePressIn = useCallback(
    (level: MoodLevel) => {
      if (disabled) return;
      triggerSelectionHaptic();
      setPressedLevel(level);
    },
    [disabled]
  );

  const handlePressOut = useCallback(() => {
    setPressedLevel(null);
  }, []);

  const displayLevel = pressedLevel ?? value;

  return (
    <Stack gap="$3" alignItems="center">
      <XStack gap={sizeConfig.gap} justifyContent="center">
        {MOOD_LEVELS.map((level) => {
          const isSelected = value === level;
          const isPressed = pressedLevel === level;

          return (
            <Pressable
              key={level}
              onPress={() => handleSelect(level)}
              onPressIn={() => handlePressIn(level)}
              onPressOut={handlePressOut}
              disabled={disabled}
              style={({ pressed }) => ({
                transform: [
                  { scale: pressed || isPressed ? 1.15 : isSelected ? 1.1 : 1 },
                ],
              })}
            >
              <Stack
                width={sizeConfig.buttonSize}
                height={sizeConfig.buttonSize}
                borderRadius={sizeConfig.buttonSize / 2}
                backgroundColor={isSelected ? "$primarySoft" : "$bgCard"}
                borderWidth={isSelected ? 2 : 1}
                borderColor={isSelected ? "$primary" : "$borderColor"}
                alignItems="center"
                justifyContent="center"
                opacity={disabled ? 0.5 : 1}
              >
                <Text fontSize={sizeConfig.fontSize}>{MOOD_EMOJIS[level]}</Text>
              </Stack>
            </Pressable>
          );
        })}
      </XStack>

      {/* Label */}
      <Text
        fontFamily="$body"
        fontSize={14}
        color="$colorMuted"
        opacity={displayLevel ? 1 : 0.5}
      >
        {displayLevel ? MOOD_LABELS[displayLevel] : "Tap to select"}
      </Text>
    </Stack>
  );
}
