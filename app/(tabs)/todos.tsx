import { useMemo, useState } from "react";
import { RefreshControl, Alert } from "react-native";
import { YStack, XStack, Text, Button, ScrollView, Spinner } from "tamagui";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { TodoItem, TodoModal } from "@/components";
import { Todo } from "@/types";
import {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from "@/hooks/useTodo";
import { useProfileStore } from "@/store/profile";

type Filter = "all" | "active" | "completed";

export default function TodosScreen() {
  const pairId = useProfileStore((s) => s.profile?.pairId);

  const { data: todos = [], isLoading, refetch, isRefetching } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [filter, setFilter] = useState<Filter>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const onRefresh = async () => {
    await refetch();
  };

  const handleToggle = (id: string) => {
    // Prevent toggling optimistic items
    if (id.startsWith("optimistic-")) {
      Alert.alert("Please wait", "Item is still syncing...");
      return;
    }

    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    updateTodo.mutate({ id, updates: { isCompleted: !todo.isCompleted } });
  };

  const handleEdit = (todo: Todo) => {
    // Prevent editing optimistic items
    if (todo.id.startsWith("optimistic-")) {
      Alert.alert("Please wait", "Item is still syncing...");
      return;
    }

    setEditingTodo(todo);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // Prevent deleting optimistic items
    if (id.startsWith("optimistic-")) {
      Alert.alert("Please wait", "Item is still syncing...");
      return;
    }

    deleteTodo.mutate(id);
  };

  const handleSave = async (
    data: Omit<Todo, "id" | "createdAt" | "createdBy">
  ) => {
    if (editingTodo) {
      // Update existing
      updateTodo.mutate({
        id: editingTodo.id,
        updates: {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          isCompleted: data.isCompleted,
          priority: data.priority,
        },
      });
      setEditingTodo(null);
    } else {
      // Create new - wait for completion
      try {
        await createTodo.mutateAsync({
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          priority: data.priority,
        });
        // Success - modal will close after refetch completes
      } catch (error) {
        console.error("Failed to create todo:", error);
        Alert.alert("Error", "Failed to create reminder. Please try again.");
      }
    }
  };

  const filteredTodos = useMemo(() => {
    if (!todos) return [];
    return todos.filter((t) => {
      if (filter === "active") return !t.isCompleted;
      if (filter === "completed") return t.isCompleted;
      return true;
    });
  }, [todos, filter]);

  const groupedTodos = useMemo(() => {
    const now = Date.now();
    const todayStr = new Date().toDateString();

    const overdue = filteredTodos.filter(
      (t) => !t.isCompleted && t.dueDate < now
    );
    const today = filteredTodos.filter(
      (t) => !t.isCompleted && new Date(t.dueDate).toDateString() === todayStr
    );
    const upcoming = filteredTodos.filter(
      (t) =>
        !t.isCompleted &&
        t.dueDate > now &&
        new Date(t.dueDate).toDateString() !== todayStr
    );
    const completed = filteredTodos.filter((t) => t.isCompleted);

    return { overdue, today, upcoming, completed };
  }, [filteredTodos]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor="$bg">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading || isRefetching}
              onRefresh={onRefresh}
            />
          }
        >
          <YStack flex={1} padding="$4" paddingTop="$6" gap="$4">
            {/* Header */}
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="$color" fontSize={28} fontWeight="900">
                Reminders
              </Text>
              <Button
                backgroundColor="$primary"
                borderRadius="$6"
                height={40}
                paddingHorizontal="$4"
                onPress={() => setModalVisible(true)}
                disabled={!pairId || createTodo.isPending}
                opacity={pairId && !createTodo.isPending ? 1 : 0.5}
                pressStyle={{ opacity: 0.8 }}
              >
                {createTodo.isPending ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <Text color="white" fontWeight="700" fontSize={15}>
                    + Add
                  </Text>
                )}
              </Button>
            </XStack>

            {/* Filter Tabs */}
            <XStack gap="$2">
              {(["all", "active", "completed"] as Filter[]).map((f) => (
                <Button
                  key={f}
                  flex={1}
                  backgroundColor={filter === f ? "$primary" : "$background"}
                  borderRadius="$5"
                  height={36}
                  onPress={() => setFilter(f)}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text
                    color={filter === f ? "white" : "$color"}
                    fontSize={14}
                    fontWeight="600"
                    textTransform="capitalize"
                  >
                    {f}
                  </Text>
                </Button>
              ))}
            </XStack>

            {/* Todos List */}
            {filteredTodos.length === 0 ? (
              <YStack
                flex={1}
                alignItems="center"
                justifyContent="center"
                gap="$3"
              >
                <Text fontSize={60}>📝</Text>
                <Text color="$muted" fontSize={16} textAlign="center">
                  {filter === "completed"
                    ? "No completed reminders yet"
                    : pairId
                    ? "No reminders yet.\nTap + Add to create one!"
                    : "Pair to start creating reminders."}
                </Text>
              </YStack>
            ) : (
              <YStack gap="$4">
                {/* Overdue */}
                {groupedTodos.overdue.length > 0 && (
                  <YStack gap="$2">
                    <Text color="#f44336" fontSize={16} fontWeight="700">
                      Overdue ({groupedTodos.overdue.length})
                    </Text>
                    {groupedTodos.overdue.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </YStack>
                )}

                {/* Today */}
                {groupedTodos.today.length > 0 && (
                  <YStack gap="$2">
                    <Text color="$color" fontSize={16} fontWeight="700">
                      Today ({groupedTodos.today.length})
                    </Text>
                    {groupedTodos.today.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </YStack>
                )}

                {/* Upcoming */}
                {groupedTodos.upcoming.length > 0 && (
                  <YStack gap="$2">
                    <Text color="$color" fontSize={16} fontWeight="700">
                      Upcoming ({groupedTodos.upcoming.length})
                    </Text>
                    {groupedTodos.upcoming.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </YStack>
                )}

                {/* Completed */}
                {groupedTodos.completed.length > 0 && filter !== "active" && (
                  <YStack gap="$2">
                    <Text color="$muted" fontSize={16} fontWeight="700">
                      Completed ({groupedTodos.completed.length})
                    </Text>
                    {groupedTodos.completed.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </YStack>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* Add/Edit Modal */}
        <TodoModal
          visible={modalVisible}
          todo={editingTodo}
          onClose={() => {
            setModalVisible(false);
            setEditingTodo(null);
          }}
          onSave={handleSave}
        />
      </YStack>
    </GestureHandlerRootView>
  );
}
