import { useMemo, useState } from "react";
import { RefreshControl } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Stack,
  Spinner,
} from "tamagui";
import { Plus, CheckCircle2, ListChecks } from "@tamagui/lucide-icons";

import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from "@/hooks/useTodo";
import { ScreenContainer, TodoItem, TodoModal } from "@/components";
import { Todo, TodoPriority } from "@/types";
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
} from "@/state/haptics";

type ViewMode = "today" | "upcoming" | "someday";
type StatusFilter = "all" | "active" | "completed";

const isToday = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const isFuture = (ts: number) => {
  const now = new Date().getTime();
  return ts > now && !isToday(ts);
};

const isSomeday = (ts: number) => {
  // Treat far-future items (e.g., > 30 days) or missing dueDate as "Someday"
  if (!ts) return true;
  const now = new Date().getTime();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return ts - now > THIRTY_DAYS;
};

export default function TodosScreen() {
  const { data: todos = [], isLoading, refetch } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [view, setView] = useState<ViewMode>("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const handleRefresh = async () => {
    setRefreshing(true);
    triggerLightHaptic();
    await refetch();
    setRefreshing(false);
  };

  const handleToggle = (id: string) => {
    triggerMediumHaptic();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    updateTodo.mutate({ id, updates: { isCompleted: !todo.isCompleted } });
  };

  const handleEdit = (todo: Todo) => {
    triggerLightHaptic();
    setEditingTodo(todo);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    triggerWarningHaptic();
    deleteTodo.mutate(id);
  };

  const handleSave = (data: Omit<Todo, "id" | "createdAt" | "createdBy">) => {
    triggerSuccessHaptic();
    if (editingTodo) {
      updateTodo.mutate({ id: editingTodo.id, updates: data });
    } else {
      createTodo.mutate({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
      });
    }
    setEditingTodo(null);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTodo(null);
  };

  const activeCount = todos.filter((t) => !t.isCompleted).length;
  const completedCount = todos.filter((t) => t.isCompleted).length;

  const filteredTodos = useMemo(() => {
    let base = todos;

    // View mode
    if (view === "today") {
      base = base.filter((t) => isToday(t.dueDate) || t.dueDate < Date.now());
    } else if (view === "upcoming") {
      base = base.filter((t) => isFuture(t.dueDate));
    } else if (view === "someday") {
      base = base.filter((t) => isSomeday(t.dueDate));
    }

    // Status filter
    if (statusFilter === "all") {
      base = base.filter((t) => !t.isCompleted);
    } else if (statusFilter === "completed") {
      base = base.filter((t) => t.isCompleted);
    }

    return base;
  }, [todos, view, statusFilter]);

  const hasAnyTodos = todos.length > 0;
  const isEmptyForCurrentView =
    !isLoading && hasAnyTodos && filteredTodos.length === 0;

  const renderEmptyForView = () => {
    if (!isEmptyForCurrentView) return null;

    let title = "";
    let body = "";

    if (view === "today") {
      title = "Nothing due today";
      body = "Enjoy the calm. Add one tiny reminder if you’d like.";
    } else if (view === "upcoming") {
      title = "No upcoming todos";
      body = "Create something to look forward to together.";
    } else {
      title = "Someday list is empty";
      body = "Capture a wish or a nice idea for later.";
    }

    return (
      <Stack
        marginTop="$5"
        padding="$5"
        borderRadius="$8"
        backgroundColor="$bgCard"
        borderWidth={1}
        borderColor="$borderColor"
        alignItems="center"
        gap="$3"
      >
        <Stack
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="$primarySoft"
          alignItems="center"
          justifyContent="center"
        >
          <ListChecks size={20} color="$primary" />
        </Stack>
        <YStack gap="$1" alignItems="center">
          <Text
            fontFamily="$heading"
            color="$color"
            fontSize={17}
            fontWeight="700"
          >
            {title}
          </Text>
          <Text
            fontFamily="$body"
            color="$colorMuted"
            fontSize={14}
            textAlign="center"
          >
            {body}
          </Text>
        </YStack>
      </Stack>
    );
  };

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <YStack flex={1} padding="$5" paddingTop="$6" gap="$4">
          {/* Header */}
          <YStack gap="$2">
            <XStack alignItems="center" justifyContent="space-between">
              <YStack gap="$1">
                <Text
                  fontFamily="$heading"
                  color="$color"
                  fontSize={26}
                  fontWeight="800"
                >
                  Reminders
                </Text>
                <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
                  Tiny things you don’t want to forget together.
                </Text>
              </YStack>

              <Button
                width={44}
                height={44}
                borderRadius="$8"
                backgroundColor="$primarySoft"
                borderWidth={1}
                borderColor="$primary"
                padding={0}
                onPress={() => {
                  triggerLightHaptic();
                  setModalVisible(true);
                }}
                pressStyle={{ opacity: 0.9, scale: 0.98 }}
              >
                <Plus size={22} color="$primary" />
              </Button>
            </XStack>

            <XStack gap="$2" alignItems="center" marginTop="$2">
              <XStack
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$5"
                backgroundColor="$bgCard"
                alignItems="center"
                gap="$2"
              >
                <CheckCircle2 size={16} color="$primary" />
                <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
                  {activeCount} active • {completedCount} completed
                </Text>
              </XStack>
            </XStack>
          </YStack>

          {/* Segmented controls */}
          <YStack gap="$2">
            {/* View mode: Today / Upcoming / Someday */}
            <XStack
              backgroundColor="$bgCard"
              borderRadius="$8"
              padding="$1"
              gap="$1"
              width={260}
            >
              <SegmentChip
                label="Today"
                isActive={view === "today"}
                onPress={() => setView("today")}
              />
              <SegmentChip
                label="Upcoming"
                isActive={view === "upcoming"}
                onPress={() => setView("upcoming")}
              />
              <SegmentChip
                label="Someday"
                isActive={view === "someday"}
                onPress={() => setView("someday")}
              />
            </XStack>

            {/* Status filter: Active / All / Completed */}
            <XStack gap="$2" alignItems="center">
              <XStack
                backgroundColor="$bgCard"
                borderRadius="$6"
                padding="$1"
                gap="$1"
              >
                <SegmentChip
                  label="All"
                  small
                  isActive={statusFilter === "all"}
                  onPress={() => setStatusFilter("all")}
                />
                <SegmentChip
                  label="Active"
                  small
                  isActive={statusFilter === "active"}
                  onPress={() => setStatusFilter("active")}
                />
                <SegmentChip
                  label="Completed"
                  small
                  isActive={statusFilter === "completed"}
                  onPress={() => setStatusFilter("completed")}
                />
              </XStack>
            </XStack>
          </YStack>

          {/* Content */}
          {isLoading ? (
            <YStack gap="$2" marginTop="$4">
              {[1, 2, 3].map((i) => (
                <Stack
                  key={i}
                  backgroundColor="$bgCard"
                  borderRadius="$7"
                  padding="$4"
                  borderWidth={1}
                  borderColor="$borderColor"
                  height={80}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner size="small" color="$primary" />
                </Stack>
              ))}
            </YStack>
          ) : !hasAnyTodos ? (
            // Global empty state
            <Stack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingVertical="$10"
              gap="$4"
            >
              <Text fontSize={56}>✨</Text>
              <YStack gap="$2" alignItems="center">
                <Text
                  fontFamily="$heading"
                  color="$color"
                  fontSize={20}
                  fontWeight="700"
                >
                  No reminders yet
                </Text>
                <Text
                  fontFamily="$body"
                  color="$colorMuted"
                  fontSize={15}
                  textAlign="center"
                  maxWidth={280}
                >
                  Create your first reminder to keep each other on the same
                  page.
                </Text>
              </YStack>
              <Button
                backgroundColor="$primary"
                borderRadius="$8"
                height={48}
                paddingHorizontal="$6"
                onPress={() => {
                  triggerLightHaptic();
                  setModalVisible(true);
                }}
                pressStyle={{ opacity: 0.9, scale: 0.98 }}
                marginTop="$2"
              >
                <Text
                  fontFamily="$body"
                  color="white"
                  fontWeight="700"
                  fontSize={16}
                >
                  Create reminder
                </Text>
              </Button>
            </Stack>
          ) : (
            <YStack gap="$3" marginTop="$2">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}

              {renderEmptyForView()}
            </YStack>
          )}

          {/* Spacer for bottom button */}
          <Stack height={80} />
        </YStack>
      </ScrollView>

      {/* Bottom Add button */}
      {hasAnyTodos && (
        <Stack
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          padding="$5"
          paddingBottom="$6"
          pointerEvents="box-none"
        >
          <Button
            borderRadius="$8"
            height={52}
            backgroundColor="$primary"
            onPress={() => {
              triggerLightHaptic();
              setModalVisible(true);
            }}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
          >
            <Text
              fontFamily="$body"
              color="white"
              fontSize={16}
              fontWeight="700"
            >
              Add a todo
            </Text>
          </Button>
        </Stack>
      )}

      {/* Todo Modal */}
      <TodoModal
        visible={modalVisible}
        todo={editingTodo}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </ScreenContainer>
  );
}

// Small pill component used for segments
type SegmentChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
  small?: boolean;
};

const SegmentChip = ({ label, isActive, onPress, small }: SegmentChipProps) => (
  <Button
    unstyled
    onPress={onPress}
    pressStyle={{ opacity: 0.8, scale: 0.98 }}
    height={44}
    justifyContent="center"
  >
    <XStack
      paddingHorizontal={small ? "$2" : "$3"}
      paddingVertical={small ? "$1" : "$2"}
      borderRadius="$8"
      backgroundColor={isActive ? "$primarySoft" : "transparent"}
      alignItems="center"
      justifyContent="center"
    >
      <Text
        fontFamily="$body"
        fontSize={small ? 13 : 14}
        fontWeight={isActive ? "700" : "500"}
        color={isActive ? "$primary" : "$colorMuted"}
      >
        {label}
      </Text>
    </XStack>
  </Button>
);
