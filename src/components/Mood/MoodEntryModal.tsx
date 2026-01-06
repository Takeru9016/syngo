import { useState } from "react";
import { KeyboardAvoidingView, Platform, Modal } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  TextArea,
  Stack,
  ScrollView,
} from "tamagui";
import { X, Lock, Globe } from "@tamagui/lucide-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MoodLevel, MoodEntry } from "@/types";
import { MoodPicker } from "./MoodPicker";
import { triggerLightHaptic, triggerSuccessHaptic } from "@/state/haptics";

type Props = {
  visible: boolean;
  existingMood?: MoodEntry | null;
  onClose: () => void;
  onSave: (data: {
    level: MoodLevel;
    note?: string;
    isPrivate: boolean;
  }) => void;
};

export function MoodEntryModal({
  visible,
  existingMood,
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState<MoodLevel | undefined>(
    existingMood?.level
  );
  const [note, setNote] = useState(existingMood?.note ?? "");
  const [isPrivate, setIsPrivate] = useState(existingMood?.isPrivate ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!existingMood;
  const canSave = level !== undefined;

  const handleSave = async () => {
    if (!canSave) return;

    setIsSaving(true);
    triggerSuccessHaptic();

    try {
      await onSave({
        level: level!,
        note: note.trim() || undefined,
        isPrivate,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save mood:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    triggerLightHaptic();
    // Reset state
    setLevel(existingMood?.level);
    setNote(existingMood?.note ?? "");
    setIsPrivate(existingMood?.isPrivate ?? false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Stack
          flex={1}
          backgroundColor="rgba(0,0,0,0.5)"
          justifyContent="flex-end"
        >
          <Stack
            backgroundColor="$bg"
            borderTopLeftRadius="$8"
            borderTopRightRadius="$8"
            maxHeight="85%"
          >
            <ScrollView
              contentContainerStyle={{
                paddingBottom: Math.max(insets.bottom, 20) + 20,
              }}
              showsVerticalScrollIndicator
            >
              <YStack padding="$5" gap="$5">
                {/* Header */}
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack gap="$1">
                    <Text
                      fontFamily="$heading"
                      fontSize={22}
                      fontWeight="800"
                      color="$color"
                    >
                      {isEditing ? "Update Mood" : "How are you feeling?"}
                    </Text>
                    <Text fontFamily="$body" fontSize={14} color="$colorMuted">
                      {isEditing
                        ? "Edit your mood entry"
                        : "Let your partner know how you're doing"}
                    </Text>
                  </YStack>

                  <Button
                    unstyled
                    width={36}
                    height={36}
                    borderRadius={18}
                    backgroundColor="$bgSoft"
                    alignItems="center"
                    justifyContent="center"
                    onPress={handleClose}
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <X size={20} color="$colorMuted" />
                  </Button>
                </XStack>

                {/* Mood Picker */}
                <YStack
                  backgroundColor="$bgCard"
                  borderRadius="$8"
                  padding="$5"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <MoodPicker value={level} onChange={setLevel} size="lg" />
                </YStack>

                {/* Note */}
                <YStack gap="$2">
                  <Text fontFamily="$body" fontSize={14} color="$colorMuted">
                    Add a note (optional)
                  </Text>
                  <TextArea
                    value={note}
                    onChangeText={setNote}
                    placeholder="What's on your mind?"
                    backgroundColor="$bgCard"
                    borderWidth={1}
                    borderColor="$borderColor"
                    borderRadius="$6"
                    padding="$3"
                    height={100}
                    fontFamily="$body"
                    fontSize={14}
                    color="$color"
                    placeholderTextColor="$colorMuted"
                  />
                </YStack>

                {/* Privacy Toggle */}
                <XStack
                  backgroundColor="$bgCard"
                  borderRadius="$6"
                  padding="$4"
                  alignItems="center"
                  justifyContent="space-between"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <XStack gap="$3" alignItems="center" flex={1}>
                    {isPrivate ? (
                      <Lock size={20} color="$colorMuted" />
                    ) : (
                      <Globe size={20} color="$primary" />
                    )}
                    <YStack flex={1}>
                      <Text
                        fontFamily="$body"
                        fontSize={14}
                        fontWeight="600"
                        color="$color"
                      >
                        {isPrivate ? "Keep Private" : "Share with Partner"}
                      </Text>
                      <Text
                        fontFamily="$body"
                        fontSize={12}
                        color="$colorMuted"
                      >
                        {isPrivate
                          ? "Only you can see this entry"
                          : "Your partner will be notified"}
                      </Text>
                    </YStack>
                  </XStack>

                  {/* Custom Toggle - larger than default Switch */}
                  <Button
                    unstyled
                    width={56}
                    height={32}
                    borderRadius={16}
                    backgroundColor={!isPrivate ? "$primary" : "$bgSoft"}
                    justifyContent="center"
                    paddingHorizontal="$1"
                    onPress={() => {
                      triggerLightHaptic();
                      setIsPrivate(!isPrivate);
                    }}
                    pressStyle={{ opacity: 0.9 }}
                  >
                    <Stack
                      width={26}
                      height={26}
                      borderRadius={13}
                      backgroundColor="white"
                      alignSelf={!isPrivate ? "flex-end" : "flex-start"}
                    />
                  </Button>
                </XStack>

                {/* Save Button */}
                <Button
                  backgroundColor={canSave ? "$primary" : "$bgSoft"}
                  borderRadius="$8"
                  height={52}
                  onPress={handleSave}
                  disabled={!canSave || isSaving}
                  pressStyle={{ opacity: 0.9, scale: 0.98 }}
                  marginTop="$2"
                >
                  <Text
                    fontFamily="$body"
                    fontSize={16}
                    fontWeight="700"
                    color={canSave ? "white" : "$colorMuted"}
                  >
                    {isSaving
                      ? "Saving..."
                      : isEditing
                      ? "Update Mood"
                      : "Save Mood"}
                  </Text>
                </Button>
              </YStack>
            </ScrollView>
          </Stack>
        </Stack>
      </KeyboardAvoidingView>
    </Modal>
  );
}
