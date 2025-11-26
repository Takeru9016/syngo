import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  KeyboardAvoidingView,
  useColorScheme,
} from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  TextArea,
  Stack,
  ScrollView,
} from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { X, Calendar, Clock, Flag } from "@tamagui/lucide-icons";

import { Todo, TodoPriority } from "@/types";
import { useThemeStore } from "@/state/theme";

type Props = {
  visible: boolean;
  todo?: Todo | null;
  onClose: () => void;
  onSave: (data: Omit<Todo, "id" | "createdAt" | "createdBy">) => void;
};

export function TodoModal({ visible, todo, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const { mode } = useThemeStore();

  // Determine if current theme is dark
  const isDark =
    mode === "dark" || (mode === "system" && systemColorScheme === "dark");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 3600000) // 1 hour from now
  );
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setDueDate(new Date(todo.dueDate));
      setPriority(todo.priority);
    } else {
      setTitle("");
      setDescription("");
      setDueDate(new Date(Date.now() + 3600000));
      setPriority("medium");
    }
    // Reset picker visibility when modal opens/closes
    setShowDatePicker(false);
    setShowTimePicker(false);
  }, [todo, visible]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate.getTime(),
      priority,
      isCompleted: todo?.isCompleted ?? false,
    });
    onClose();
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Stack
          flex={1}
          backgroundColor="rgba(0,0,0,0.4)"
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
                paddingBottom: Math.max(insets.bottom, 20) + 40,
              }}
              showsVerticalScrollIndicator
            >
              <YStack padding="$5" gap="$4">
                {/* Header */}
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack>
                    <Text
                      fontFamily="$heading"
                      color="$color"
                      fontSize={22}
                      fontWeight="800"
                    >
                      {todo ? "Edit reminder" : "New reminder"}
                    </Text>
                    <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
                      Set a gentle nudge for the two of you.
                    </Text>
                  </YStack>
                  <Button unstyled onPress={onClose} hitSlop={16}>
                    <X size={22} color="$colorMuted" />
                  </Button>
                </XStack>

                {/* Title */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    Title
                  </Text>
                  <Input
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Plan the weekend, pick up flowers..."
                    backgroundColor="$bgCard"
                    borderColor="$borderColor"
                    borderRadius="$7"
                    height={46}
                    fontSize={15}
                    fontFamily="$body"
                    color="$color"
                  />
                </YStack>

                {/* Description */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    Description
                  </Text>
                  <TextArea
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add details (optional)"
                    backgroundColor="$bgCard"
                    borderColor="$borderColor"
                    borderRadius="$8"
                    minHeight={90}
                    fontSize={15}
                    fontFamily="$body"
                    color="$color"
                    padding="$4"
                    verticalAlign="top"
                    multiline
                  />
                </YStack>

                {/* Date & Time */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    Due date & time
                  </Text>
                  <XStack gap="$2">
                    <Button
                      flex={1}
                      backgroundColor="$bgCard"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius="$7"
                      height={44}
                      onPress={() => {
                        setShowDatePicker((prev) => !prev);
                        setShowTimePicker(false);
                      }}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <XStack
                        alignItems="center"
                        justifyContent="center"
                        gap="$2"
                      >
                        <Calendar size={16} color="$colorMuted" />
                        <Text fontFamily="$body" color="$color" fontSize={15}>
                          {formatDate(dueDate)}
                        </Text>
                      </XStack>
                    </Button>
                    <Button
                      flex={1}
                      backgroundColor="$bgCard"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius="$7"
                      height={44}
                      onPress={() => {
                        setShowTimePicker((prev) => !prev);
                        setShowDatePicker(false);
                      }}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <XStack
                        alignItems="center"
                        justifyContent="center"
                        gap="$2"
                      >
                        <Clock size={16} color="$colorMuted" />
                        <Text fontFamily="$body" color="$color" fontSize={15}>
                          {formatTime(dueDate)}
                        </Text>
                      </XStack>
                    </Button>
                  </XStack>
                </YStack>

                {/* Date Picker with theme awareness */}
                {showDatePicker && (
                  <YStack
                    backgroundColor="$bgCard"
                    borderRadius="$6"
                    padding="$3"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "inline" : "default"}
                      onChange={(_, date) => {
                        if (Platform.OS !== "ios") {
                          setShowDatePicker(false);
                        }
                        if (date) setDueDate(date);
                      }}
                      themeVariant={isDark ? "dark" : "light"}
                    />
                  </YStack>
                )}

                {/* Time Picker with theme awareness */}
                {showTimePicker && (
                  <YStack
                    backgroundColor="$bgCard"
                    borderRadius="$6"
                    padding="$3"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <DateTimePicker
                      value={dueDate}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(_, date) => {
                        if (Platform.OS !== "ios") {
                          setShowTimePicker(false);
                        }
                        if (date) setDueDate(date);
                      }}
                      themeVariant={isDark ? "dark" : "light"}
                    />
                  </YStack>
                )}

                {/* Priority */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    Priority
                  </Text>
                  <XStack gap="$2">
                    {(["low", "medium", "high"] as TodoPriority[]).map((p) => {
                      const isActive = priority === p;
                      const label =
                        p === "low"
                          ? "Low"
                          : p === "medium"
                          ? "Normal"
                          : "High";

                      return (
                        <Button
                          key={p}
                          flex={1}
                          backgroundColor={
                            isActive ? "$primarySoft" : "$bgCard"
                          }
                          borderColor={isActive ? "$primary" : "$borderColor"}
                          borderWidth={1}
                          borderRadius="$7"
                          height={44}
                          onPress={() => setPriority(p)}
                          pressStyle={{ opacity: 0.8 }}
                        >
                          <XStack
                            alignItems="center"
                            justifyContent="center"
                            gap="$2"
                          >
                            <Flag
                              size={14}
                              color={isActive ? "$primary" : "$colorMuted"}
                            />
                            <Text
                              fontFamily="$body"
                              color={isActive ? "$primary" : "$color"}
                              fontSize={14}
                              fontWeight="600"
                            >
                              {label}
                            </Text>
                          </XStack>
                        </Button>
                      );
                    })}
                  </XStack>
                </YStack>

                {/* Save Button */}
                <Button
                  backgroundColor="$primary"
                  borderRadius="$8"
                  height={48}
                  onPress={handleSave}
                  disabled={!title.trim()}
                  opacity={!title.trim() ? 0.5 : 1}
                  pressStyle={{ opacity: 0.85 }}
                  marginTop="$2"
                >
                  <Text
                    fontFamily="$body"
                    color="white"
                    fontWeight="700"
                    fontSize={16}
                  >
                    {todo ? "Update reminder" : "Create reminder"}
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
