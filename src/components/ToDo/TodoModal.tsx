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
import {
  X,
  Calendar,
  Clock,
  Flag,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Plane,
  UtensilsCrossed,
  Mountain,
  Heart,
  Sparkles,
} from "@tamagui/lucide-icons";

import {
  Todo,
  TodoPriority,
  ListItemType,
  DreamCategory,
  Subtask,
} from "@/types";
import { useThemeStore } from "@/state/theme";
import { triggerLightHaptic, triggerSelectionHaptic } from "@/state/haptics";

// Generate a simple UUID for subtasks
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Dream category config
const DREAM_CATEGORIES: {
  value: DreamCategory;
  label: string;
  icon: typeof Plane;
  emoji: string;
}[] = [
  { value: "travel", label: "Travel", icon: Plane, emoji: "✈️" },
  { value: "food", label: "Food", icon: UtensilsCrossed, emoji: "🍕" },
  { value: "adventure", label: "Adventure", icon: Mountain, emoji: "🎢" },
  { value: "together", label: "Together", icon: Heart, emoji: "💕" },
  { value: "other", label: "Other", icon: Sparkles, emoji: "✨" },
];

type Props = {
  visible: boolean;
  todo?: Todo | null;
  listType?: ListItemType; // New prop to determine if creating task or dream
  onClose: () => void;
  onSave: (data: Omit<Todo, "id" | "createdAt" | "createdBy">) => void;
};

export function TodoModal({
  visible,
  todo,
  listType: propListType,
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  const { mode } = useThemeStore();

  // Determine if current theme is dark
  const isDark =
    mode === "dark" || (mode === "system" && systemColorScheme === "dark");

  // Core fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 3600000), // 1 hour from now
  );
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Together List fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setListType] = useState<ListItemType>("task");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [category, setCategory] = useState<DreamCategory>("other");

  // Determine actual list type (from prop or existing todo)
  const effectiveListType = todo?.listType || propListType || "task";
  const isDream = effectiveListType === "dream";

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setDueDate(new Date(todo.dueDate ?? Date.now() + 3600000));
      setPriority(todo.priority);
      setListType(todo.listType || "task");
      setSubtasks(todo.subtasks || []);
      setCategory(todo.category || "other");
    } else {
      setTitle("");
      setDescription("");
      setDueDate(new Date(Date.now() + 3600000));
      setPriority("medium");
      setListType(propListType || "task");
      setSubtasks([]);
      setCategory("other");
    }
    setNewSubtaskTitle("");
    setShowDatePicker(false);
    setShowTimePicker(false);
  }, [todo, visible, propListType]);

  const handleSave = () => {
    if (!title.trim()) return;

    const data: Omit<Todo, "id" | "createdAt" | "createdBy"> = {
      title: title.trim(),
      description: description.trim(),
      priority,
      isCompleted: todo?.isCompleted ?? false,
      listType: effectiveListType,
    };

    // Include dueDate for tasks, optional for dreams
    if (!isDream || dueDate) {
      data.dueDate = dueDate.getTime();
    }

    // Include subtasks for tasks (even if empty, to clear them)
    if (!isDream) {
      data.subtasks = subtasks;
    }

    // Include category for dreams
    if (isDream) {
      data.category = category;
    }

    onSave(data);
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    triggerLightHaptic();
    const newSubtask: Subtask = {
      id: generateId(),
      title: newSubtaskTitle.trim(),
      isCompleted: false,
      createdAt: Date.now(),
    };
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const toggleSubtask = (id: string) => {
    triggerSelectionHaptic();
    setSubtasks(
      subtasks.map((s) =>
        s.id === id ? { ...s, isCompleted: !s.isCompleted } : s,
      ),
    );
  };

  const removeSubtask = (id: string) => {
    triggerLightHaptic();
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const updateSubtaskTitle = (id: string, newTitle: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, title: newTitle } : s)),
    );
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

  // Calculate subtask progress
  const completedSubtasks = subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = subtasks.length;

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
            maxHeight="90%"
          >
            <ScrollView
              contentContainerStyle={{
                paddingBottom: Math.max(insets.bottom, 20) + 40,
              }}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
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
                      {todo ?
                        isDream ?
                          "Edit dream"
                        : "Edit reminder"
                      : isDream ?
                        "New dream"
                      : "New reminder"}
                    </Text>
                    <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
                      {isDream ?
                        "Add something you want to do together."
                      : "Set a gentle nudge for the two of you."}
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
                    placeholder={
                      isDream ?
                        "Visit Paris, learn to cook Thai..."
                      : "Plan the weekend, pick up flowers..."
                    }
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

                {/* Category Picker (Dreams only) */}
                {isDream && (
                  <YStack gap="$2">
                    <Text
                      fontFamily="$body"
                      color="$color"
                      fontSize={14}
                      fontWeight="600"
                    >
                      Category
                    </Text>
                    <XStack gap="$2" flexWrap="wrap">
                      {DREAM_CATEGORIES.map((cat) => {
                        const isActive = category === cat.value;
                        const Icon = cat.icon;
                        return (
                          <Button
                            key={cat.value}
                            backgroundColor={
                              isActive ? "$primarySoft" : "$bgCard"
                            }
                            borderColor={isActive ? "$primary" : "$borderColor"}
                            borderWidth={1}
                            borderRadius="$7"
                            height={40}
                            paddingHorizontal="$3"
                            onPress={() => {
                              triggerSelectionHaptic();
                              setCategory(cat.value);
                            }}
                            pressStyle={{ opacity: 0.8 }}
                          >
                            <XStack
                              alignItems="center"
                              justifyContent="center"
                              gap="$2"
                            >
                              <Icon
                                size={14}
                                color={isActive ? "$primary" : "$colorMuted"}
                              />
                              <Text
                                fontFamily="$body"
                                color={isActive ? "$primary" : "$color"}
                                fontSize={13}
                                fontWeight="600"
                              >
                                {cat.label}
                              </Text>
                            </XStack>
                          </Button>
                        );
                      })}
                    </XStack>
                  </YStack>
                )}

                {/* Subtasks Section (Tasks only) */}
                {!isDream && (
                  <YStack gap="$2">
                    <XStack alignItems="center" justifyContent="space-between">
                      <Text
                        fontFamily="$body"
                        color="$color"
                        fontSize={14}
                        fontWeight="600"
                      >
                        Subtasks
                      </Text>
                      {totalSubtasks > 0 && (
                        <Text
                          fontFamily="$body"
                          color="$colorMuted"
                          fontSize={12}
                        >
                          {completedSubtasks}/{totalSubtasks} done
                        </Text>
                      )}
                    </XStack>

                    {/* Existing subtasks */}
                    {subtasks.map((subtask) => (
                      <XStack
                        key={subtask.id}
                        alignItems="center"
                        gap="$2"
                        backgroundColor="$bgCard"
                        borderRadius="$6"
                        padding="$3"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <Button
                          unstyled
                          onPress={() => toggleSubtask(subtask.id)}
                          hitSlop={8}
                        >
                          {subtask.isCompleted ?
                            <CheckCircle2 size={20} color="$primary" />
                          : <Circle size={20} color="$colorMuted" />}
                        </Button>
                        <Input
                          flex={1}
                          value={subtask.title}
                          onChangeText={(text) =>
                            updateSubtaskTitle(subtask.id, text)
                          }
                          backgroundColor="transparent"
                          borderWidth={0}
                          height={32}
                          fontSize={14}
                          fontFamily="$body"
                          color={subtask.isCompleted ? "$colorMuted" : "$color"}
                          textDecorationLine={
                            subtask.isCompleted ? "line-through" : "none"
                          }
                          paddingHorizontal={0}
                        />
                        <Button
                          unstyled
                          onPress={() => removeSubtask(subtask.id)}
                          hitSlop={8}
                        >
                          <Trash2 size={16} color="$colorMuted" />
                        </Button>
                      </XStack>
                    ))}

                    {/* Add new subtask */}
                    <XStack alignItems="center" gap="$2">
                      <Input
                        flex={1}
                        value={newSubtaskTitle}
                        onChangeText={setNewSubtaskTitle}
                        placeholder="Add a subtask..."
                        backgroundColor="$bgCard"
                        borderColor="$borderColor"
                        borderRadius="$6"
                        height={40}
                        fontSize={14}
                        fontFamily="$body"
                        color="$color"
                        onSubmitEditing={addSubtask}
                        returnKeyType="done"
                      />
                      <Button
                        backgroundColor="$primarySoft"
                        borderColor="$primary"
                        borderWidth={1}
                        borderRadius="$6"
                        width={40}
                        height={40}
                        padding={0}
                        onPress={addSubtask}
                        disabled={!newSubtaskTitle.trim()}
                        opacity={!newSubtaskTitle.trim() ? 0.5 : 1}
                        pressStyle={{ opacity: 0.8 }}
                      >
                        <Plus size={18} color="$primary" />
                      </Button>
                    </XStack>
                  </YStack>
                )}

                {/* Date & Time (optional for dreams) */}
                <YStack gap="$2">
                  <Text
                    fontFamily="$body"
                    color="$color"
                    fontSize={14}
                    fontWeight="600"
                  >
                    {isDream ? "Target date (optional)" : "Due date & time"}
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
                    {!isDream && (
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
                    )}
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
                    {isDream ? "Importance" : "Priority"}
                  </Text>
                  <XStack gap="$2">
                    {(["low", "medium", "high"] as TodoPriority[]).map((p) => {
                      const isActive = priority === p;
                      const label =
                        p === "low" ? "Low"
                        : p === "medium" ? "Normal"
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
                    {todo ?
                      isDream ?
                        "Update dream"
                      : "Update reminder"
                    : isDream ?
                      "Add to bucket list"
                    : "Create reminder"}
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
