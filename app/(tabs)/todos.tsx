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
import {
  Plus,
  CheckCircle2,
  ListChecks,
  Sparkles,
  ClipboardList,
  Star,
  Plane,
  UtensilsCrossed,
  Mountain,
  Heart,
} from "@tamagui/lucide-icons";

import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from "@/hooks/useTodo";
import { ScreenContainer, TodoItem, TodoModal } from "@/components";
import { Todo, ListItemType, DreamCategory } from "@/types";
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerWarningHaptic,
  triggerSelectionHaptic,
} from "@/state/haptics";
import { useToast } from "@/hooks/useToast";
import { AppNotificationService } from "@/services/notification/notification.service";

type ViewMode = "today" | "upcoming" | "someday";
type StatusFilter = "all" | "active" | "completed";
type DreamFilter = "all" | DreamCategory;

const isToday = (ts?: number) => {
  if (!ts) return false;
  const d = new Date(ts);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const isFuture = (ts?: number) => {
  if (!ts) return false;
  const now = new Date().getTime();
  return ts > now && !isToday(ts);
};

const isSomeday = (ts?: number) => {
  if (!ts) return true;
  const now = new Date().getTime();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return ts - now > THIRTY_DAYS;
};

// Dream category config
const DREAM_CATEGORIES: {
  value: DreamFilter;
  label: string;
  icon: typeof Plane;
}[] = [
  { value: "all", label: "All", icon: Star },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "adventure", label: "Adventure", icon: Mountain },
  { value: "together", label: "Together", icon: Heart },
  { value: "other", label: "Other", icon: Sparkles },
];

export default function TodosScreen() {
  const { data: todos = [], isLoading, refetch } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const { success, info } = useToast();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Top-level toggle: Tasks or Dreams
  const [listMode, setListMode] = useState<ListItemType>("task");

  // Task-specific filters
  const [view, setView] = useState<ViewMode>("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  // Dream-specific filters
  const [dreamCategory, setDreamCategory] = useState<DreamFilter>("all");
  const [dreamStatus, setDreamStatus] = useState<"pending" | "achieved">(
    "pending"
  );

  const isDreamMode = listMode === "dream";

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

    const newCompletedState = !todo.isCompleted;
    const updates: Partial<Todo> = { isCompleted: newCompletedState };

    // For dreams, also set completedDate
    if (todo.listType === "dream" && newCompletedState) {
      updates.completedDate = Date.now();
    }

    updateTodo.mutate({ id, updates });

    if (newCompletedState) {
      const message = todo.listType === "dream" ? "Dream Achieved!" : "Done!";
      success(message, todo.title);
      AppNotificationService.sendToPartner({
        type: "todo_completed",
        title:
          todo.listType === "dream" ? "Dream achieved! ✨" : "Todo completed",
        body: `"${todo.title}" was marked as done!`,
        data: { todoId: id },
      }).catch(console.error);
    } else {
      info(isDreamMode ? "Dream Reopened" : "Todo Reopened", todo.title);
    }
  };

  const handleEdit = (todo: Todo) => {
    triggerLightHaptic();
    setEditingTodo(todo);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    triggerWarningHaptic();
    const todo = todos.find((t) => t.id === id);
    deleteTodo.mutate(id);

    if (todo) {
      info(isDreamMode ? "Dream Removed" : "Todo Deleted", todo.title);
    }
  };

  const handleSubtaskToggle = (todoId: string, subtaskId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo || !todo.subtasks) return;

    const updatedSubtasks = todo.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
    );

    updateTodo.mutate({ id: todoId, updates: { subtasks: updatedSubtasks } });
  };

  const handleSave = (data: Omit<Todo, "id" | "createdAt" | "createdBy">) => {
    triggerSuccessHaptic();
    if (editingTodo) {
      updateTodo.mutate({ id: editingTodo.id, updates: data });
      success(isDreamMode ? "Dream Updated" : "Todo Updated", data.title);
    } else {
      createTodo.mutate({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        listType: data.listType,
        subtasks: data.subtasks,
        category: data.category,
        photos: data.photos,
      });

      const isDream = data.listType === "dream";
      success(isDream ? "Dream Added ✨" : "Todo Created", data.title);

      AppNotificationService.sendToPartner({
        type: "todo_created",
        title: isDream ? "New dream added ✨" : "New todo added",
        body: `"${data.title}" was added to your shared list`,
        data: { todoTitle: data.title },
      }).catch(console.error);
    }
    setEditingTodo(null);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTodo(null);
  };

  // Separate todos into tasks and dreams
  const tasks = todos.filter((t) => t.listType !== "dream");
  const dreams = todos.filter((t) => t.listType === "dream");

  const activeTaskCount = tasks.filter((t) => !t.isCompleted).length;
  const completedTaskCount = tasks.filter((t) => t.isCompleted).length;
  const pendingDreamCount = dreams.filter((t) => !t.isCompleted).length;
  const achievedDreamCount = dreams.filter((t) => t.isCompleted).length;

  const filteredItems = useMemo(() => {
    if (isDreamMode) {
      // Filter dreams
      let base = dreams;

      // Category filter
      if (dreamCategory !== "all") {
        base = base.filter((t) => t.category === dreamCategory);
      }

      // Status filter
      if (dreamStatus === "pending") {
        base = base.filter((t) => !t.isCompleted);
      } else {
        base = base.filter((t) => t.isCompleted);
      }

      return base;
    } else {
      // Filter tasks
      let base = tasks;

      // View mode
      if (view === "today") {
        base = base.filter(
          (t) => isToday(t.dueDate) || (t.dueDate && t.dueDate < Date.now())
        );
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
    }
  }, [
    todos,
    listMode,
    view,
    statusFilter,
    dreamCategory,
    dreamStatus,
    isDreamMode,
    tasks,
    dreams,
  ]);

  const hasAnyItems = isDreamMode ? dreams.length > 0 : tasks.length > 0;
  const isEmptyForCurrentView =
    !isLoading && hasAnyItems && filteredItems.length === 0;

  const renderEmptyForView = () => {
    if (!isEmptyForCurrentView) return null;

    let title = "";
    let body = "";

    if (isDreamMode) {
      if (dreamStatus === "pending") {
        title = "No pending dreams";
        body = "All caught up! Add something new to dream about together.";
      } else {
        title = "No achieved dreams yet";
        body = "Start checking off your bucket list!";
      }
    } else {
      if (view === "today") {
        title = "Nothing due today";
        body = "Enjoy the calm. Add one tiny reminder if you'd like.";
      } else if (view === "upcoming") {
        title = "No upcoming todos";
        body = "Create something to look forward to together.";
      } else {
        title = "Someday list is empty";
        body = "Capture a wish or a nice idea for later.";
      }
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
          {isDreamMode ? (
            <Sparkles size={20} color="$primary" />
          ) : (
            <ListChecks size={20} color="$primary" />
          )}
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
                  Together List
                </Text>
                <Text fontFamily="$body" color="$colorMuted" fontSize={13}>
                  {isDreamMode
                    ? "Dreams and adventures to share."
                    : "Tiny things you don't want to forget."}
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

            {/* Stats */}
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
                  {isDreamMode
                    ? `${pendingDreamCount} pending • ${achievedDreamCount} achieved`
                    : `${activeTaskCount} active • ${completedTaskCount} completed`}
                </Text>
              </XStack>
            </XStack>
          </YStack>

          {/* Top-level Toggle: Tasks / Dreams */}
          <XStack
            backgroundColor="$bgCard"
            borderRadius="$8"
            padding="$1"
            gap="$1"
          >
            <Button
              flex={1}
              backgroundColor={!isDreamMode ? "$primarySoft" : "transparent"}
              borderRadius="$7"
              height={44}
              onPress={() => {
                triggerSelectionHaptic();
                setListMode("task");
              }}
              pressStyle={{ opacity: 0.8 }}
            >
              <XStack alignItems="center" gap="$2">
                <ClipboardList
                  size={18}
                  color={!isDreamMode ? "$primary" : "$colorMuted"}
                />
                <Text
                  fontFamily="$body"
                  fontSize={15}
                  fontWeight={!isDreamMode ? "700" : "500"}
                  color={!isDreamMode ? "$primary" : "$colorMuted"}
                >
                  Tasks
                </Text>
              </XStack>
            </Button>
            <Button
              flex={1}
              backgroundColor={isDreamMode ? "$primarySoft" : "transparent"}
              borderRadius="$7"
              height={44}
              onPress={() => {
                triggerSelectionHaptic();
                setListMode("dream");
              }}
              pressStyle={{ opacity: 0.8 }}
            >
              <XStack alignItems="center" gap="$2">
                <Sparkles
                  size={18}
                  color={isDreamMode ? "$primary" : "$colorMuted"}
                />
                <Text
                  fontFamily="$body"
                  fontSize={15}
                  fontWeight={isDreamMode ? "700" : "500"}
                  color={isDreamMode ? "$primary" : "$colorMuted"}
                >
                  Dreams
                </Text>
              </XStack>
            </Button>
          </XStack>

          {/* Mode-specific filters */}
          <YStack gap="$2">
            {isDreamMode ? (
              <>
                {/* Dream category filter */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {DREAM_CATEGORIES.map((cat) => {
                    const isActive = dreamCategory === cat.value;
                    const Icon = cat.icon;
                    return (
                      <Button
                        key={cat.value}
                        backgroundColor={isActive ? "$primarySoft" : "$bgCard"}
                        borderColor={isActive ? "$primary" : "$borderColor"}
                        borderWidth={1}
                        borderRadius="$6"
                        height={36}
                        paddingHorizontal="$3"
                        onPress={() => {
                          triggerSelectionHaptic();
                          setDreamCategory(cat.value);
                        }}
                        pressStyle={{ opacity: 0.8 }}
                      >
                        <XStack alignItems="center" gap="$2">
                          <Icon
                            size={14}
                            color={isActive ? "$primary" : "$colorMuted"}
                          />
                          <Text
                            fontFamily="$body"
                            fontSize={13}
                            fontWeight={isActive ? "600" : "500"}
                            color={isActive ? "$primary" : "$colorMuted"}
                          >
                            {cat.label}
                          </Text>
                        </XStack>
                      </Button>
                    );
                  })}
                </ScrollView>

                {/* Dream status filter */}
                <XStack
                  backgroundColor="$bgCard"
                  borderRadius="$6"
                  padding="$1"
                  gap="$1"
                  alignSelf="flex-start"
                >
                  <SegmentChip
                    label="Pending"
                    small
                    isActive={dreamStatus === "pending"}
                    onPress={() => setDreamStatus("pending")}
                  />
                  <SegmentChip
                    label="Achieved"
                    small
                    isActive={dreamStatus === "achieved"}
                    onPress={() => setDreamStatus("achieved")}
                  />
                </XStack>
              </>
            ) : (
              <>
                {/* Task view mode: Today / Upcoming / Someday */}
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

                {/* Task status filter */}
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
              </>
            )}
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
          ) : !hasAnyItems ? (
            // Global empty state
            <Stack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingVertical="$10"
              gap="$4"
            >
              <Stack
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="$primarySoft"
                alignItems="center"
                justifyContent="center"
              >
                {isDreamMode ? (
                  <Sparkles size={36} color="$primary" />
                ) : (
                  <ListChecks size={36} color="$primary" />
                )}
              </Stack>
              <YStack gap="$2" alignItems="center">
                <Text
                  fontFamily="$heading"
                  color="$color"
                  fontSize={20}
                  fontWeight="700"
                >
                  {isDreamMode ? "No dreams yet" : "No tasks yet"}
                </Text>
                <Text
                  fontFamily="$body"
                  color="$colorMuted"
                  fontSize={15}
                  textAlign="center"
                  maxWidth={280}
                >
                  {isDreamMode
                    ? "Add your first dream or bucket list item together."
                    : "Create your first reminder to keep each other on track."}
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
                  {isDreamMode ? "Add a dream" : "Create task"}
                </Text>
              </Button>
            </Stack>
          ) : (
            <YStack gap="$3" marginTop="$2">
              {filteredItems.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSubtaskToggle={handleSubtaskToggle}
                  index={index}
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
      {hasAnyItems && (
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
              {isDreamMode ? "Add a dream" : "Add a task"}
            </Text>
          </Button>
        </Stack>
      )}

      {/* Todo Modal */}
      <TodoModal
        visible={modalVisible}
        todo={editingTodo}
        listType={listMode}
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
      overflow="hidden"
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
