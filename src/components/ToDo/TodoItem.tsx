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
} from "@tamagui/lucide-icons";

import { Todo } from "@/types";
import { triggerSelectionHaptic } from "@/state/haptics";
import { useSlideIn, useBounce, getStaggerDelay } from "@/utils/animations";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  index?: number;
};

export function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  index = 0,
}: Props) {
  const [swiping, setSwiping] = useState(false);
  const { opacity, transform } = useSlideIn(
    "left",
    getStaggerDelay(index, 50, 250)
  );
  const { bounce, transform: bounceTransform } = useBounce();

  const formatDate = (ts: number) => {
    if (!ts) return "No date";
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
    !!todo.dueDate && todo.dueDate < Date.now() && !todo.isCompleted;

  const getPriorityColor = () => {
    if (todo.priority === "high") return "#ff7b7b";
    if (todo.priority === "medium") return "#ffa726";
    return "#66bb6a";
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete reminder",
      "Are you sure you want to delete this reminder?",
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
          borderColor="$borderColor"
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

              <XStack
                gap="$2"
                alignItems="center"
                marginTop="$2"
                flexWrap="wrap"
              >
                <XStack alignItems="center" gap="$2">
                  <CalendarClock size={14} color="$colorMuted" />
                  <Text fontFamily="$body" color="$colorMuted" fontSize={12}>
                    {formatDate(todo.dueDate)}
                  </Text>
                </XStack>

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
