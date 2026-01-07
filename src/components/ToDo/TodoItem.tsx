import { useState } from "react";
import { Alert, Animated } from "react-native";
import { XStack, YStack, Text, Stack, Button } from "tamagui";
import { Swipeable } from "react-native-gesture-handler";
import {
  CheckCircle2,
  Circle,
  CalendarClock,
  Flag,
  Pencil,
  Trash2,
  Plane,
  UtensilsCrossed,
  Mountain,
  Heart,
  Sparkles,
} from "@tamagui/lucide-icons";

import { Todo, DreamCategory } from "@/types";
import { triggerSelectionHaptic, triggerLightHaptic } from "@/state/haptics";
import { useSlideIn, useBounce, getStaggerDelay } from "@/utils/animations";

// Category config for display
const CATEGORY_CONFIG: Record<
  DreamCategory,
  { icon: typeof Plane; label: string }
> = {
  travel: { icon: Plane, label: "Travel" },
  food: { icon: UtensilsCrossed, label: "Food" },
  adventure: { icon: Mountain, label: "Adventure" },
  together: { icon: Heart, label: "Together" },
  other: { icon: Sparkles, label: "Other" },
};

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onSubtaskToggle?: (todoId: string, subtaskId: string) => void;
  index?: number;
};

export function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  onSubtaskToggle,
  index = 0,
}: Props) {
  const [swiping, setSwiping] = useState(false);
  const { opacity, transform } = useSlideIn(
    "left",
    getStaggerDelay(index, 50, 250)
  );
  const { bounce, transform: bounceTransform } = useBounce();

  const isDream = todo.listType === "dream";

  const formatDate = (ts?: number) => {
    if (!ts) return isDream ? "Someday" : "No date";
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow =
      date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    if (isToday) return `Today • ${timeStr}`;
    if (isTomorrow) return `Tomorrow • ${timeStr}`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isOverdue =
    !!todo.dueDate &&
    todo.dueDate < Date.now() &&
    !todo.isCompleted &&
    !isDream;

  const getPriorityColor = () => {
    if (todo.priority === "high") return "#ff7b7b";
    if (todo.priority === "medium") return "#ffa726";
    return "#66bb6a";
  };

  // Subtasks
  const subtasks = todo.subtasks || [];
  const hasSubtasks = subtasks.length > 0;

  // Category display
  const categoryConfig = todo.category
    ? CATEGORY_CONFIG[todo.category]
    : CATEGORY_CONFIG.other;

  const handleDelete = () => {
    Alert.alert(
      isDream ? "Delete dream" : "Delete reminder",
      `Are you sure you want to delete this ${isDream ? "dream" : "reminder"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(todo.id),
        },
      ]
    );
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    triggerLightHaptic();
    if (onSubtaskToggle) {
      onSubtaskToggle(todo.id, subtaskId);
    }
  };

  const renderRightActions = () => (
    <XStack gap="$2" paddingLeft="$2" alignItems="center">
      <Button
        backgroundColor="$primarySoft"
        borderRadius="$6"
        width={80}
        height={80}
        onPress={() => {
          triggerSelectionHaptic();
          onEdit(todo);
        }}
        pressStyle={{ opacity: 0.9 }}
      >
        <XStack alignItems="center" gap="$2" justifyContent="center">
          <Pencil size={16} color="$primary" />
          <Text
            fontFamily="$body"
            color="$primary"
            fontWeight="700"
            fontSize={13}
          >
            Edit
          </Text>
        </XStack>
      </Button>
      <Button
        backgroundColor="#f44336"
        borderRadius="$6"
        width={80}
        height={80}
        onPress={handleDelete}
        pressStyle={{ opacity: 0.9 }}
      >
        <XStack alignItems="center" gap="$2" justifyContent="center">
          <Trash2 size={16} color="white" />
          <Text fontFamily="$body" color="white" fontWeight="700" fontSize={13}>
            Delete
          </Text>
        </XStack>
      </Button>
    </XStack>
  );

  return (
    <Animated.View style={{ opacity, transform }}>
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => setSwiping(true)}
        onSwipeableClose={() => setSwiping(false)}
      >
        <Stack
          backgroundColor="$bgCard"
          borderRadius="$8"
          padding="$4"
          marginBottom="$2"
          borderWidth={1}
          borderColor={isDream ? "$primary" : "$borderColor"}
          borderLeftWidth={isDream ? 3 : 1}
          opacity={todo.isCompleted ? 0.55 : 1}
        >
          <XStack gap="$3" alignItems="flex-start">
            {/* Checkbox with bounce animation */}
            <Animated.View style={{ transform: bounceTransform }}>
              <Button
                unstyled
                width={44}
                height={44}
                borderRadius={13}
                alignItems="center"
                justifyContent="center"
                onPress={() => {
                  bounce();
                  triggerSelectionHaptic();
                  onToggle(todo.id);
                }}
                marginTop={2}
              >
                {todo.isCompleted ? (
                  <CheckCircle2 size={22} color="$primary" />
                ) : (
                  <Circle size={22} color="$borderColor" />
                )}
              </Button>
            </Animated.View>

            {/* Content */}
            <YStack flex={1} gap="$1">
              <Text
                fontFamily="$body"
                color="$color"
                fontSize={16}
                fontWeight="700"
                textDecorationLine={todo.isCompleted ? "line-through" : "none"}
              >
                {todo.title}
              </Text>

              {todo.description ? (
                <Text
                  fontFamily="$body"
                  color="$colorMuted"
                  fontSize={14}
                  numberOfLines={2}
                  textDecorationLine={
                    todo.isCompleted ? "line-through" : "none"
                  }
                >
                  {todo.description}
                </Text>
              ) : null}

              {/* Subtasks - always visible */}
              {hasSubtasks && !isDream && (
                <YStack gap="$2" marginTop="$2">
                  {subtasks.map((subtask) => (
                    <Button
                      key={subtask.id}
                      unstyled
                      onPress={() => handleSubtaskToggle(subtask.id)}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <XStack alignItems="center" gap="$2" paddingVertical="$1">
                        {subtask.isCompleted ? (
                          <CheckCircle2 size={18} color="$primary" />
                        ) : (
                          <Circle size={18} color="$borderColor" />
                        )}
                        <Text
                          fontFamily="$body"
                          color={subtask.isCompleted ? "$colorMuted" : "$color"}
                          fontSize={14}
                          textDecorationLine={
                            subtask.isCompleted ? "line-through" : "none"
                          }
                          flex={1}
                        >
                          {subtask.title}
                        </Text>
                      </XStack>
                    </Button>
                  ))}
                </YStack>
              )}

              <XStack
                gap="$2"
                alignItems="center"
                marginTop="$2"
                flexWrap="wrap"
              >
                {/* Category badge for dreams */}
                {isDream && (
                  <XStack
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$5"
                    backgroundColor="$primarySoft"
                    alignItems="center"
                    gap="$1"
                  >
                    <categoryConfig.icon size={12} color="$primary" />
                    <Text
                      fontFamily="$body"
                      color="$primary"
                      fontSize={11}
                      fontWeight="600"
                    >
                      {categoryConfig.label}
                    </Text>
                  </XStack>
                )}

                {/* Date display */}
                <XStack alignItems="center" gap="$2">
                  <CalendarClock size={14} color="$colorMuted" />
                  <Text fontFamily="$body" color="$colorMuted" fontSize={12}>
                    {formatDate(todo.dueDate)}
                  </Text>
                </XStack>

                {/* Overdue badge (tasks only) */}
                {isOverdue && (
                  <XStack
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$5"
                    backgroundColor="$primarySoft"
                    alignItems="center"
                    gap="$1"
                  >
                    <Text
                      fontFamily="$body"
                      color="$primary"
                      fontSize={11}
                      fontWeight="700"
                    >
                      Overdue
                    </Text>
                  </XStack>
                )}

                {/* Priority indicator */}
                <XStack alignItems="center" gap="$2">
                  <Flag size={13} color="$colorMuted" />
                  <Stack
                    width={10}
                    height={10}
                    borderRadius={5}
                    backgroundColor={getPriorityColor()}
                  />
                </XStack>
              </XStack>
            </YStack>
          </XStack>
        </Stack>
      </Swipeable>
    </Animated.View>
  );
}
