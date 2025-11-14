import { useState } from "react";
import { RefreshControl, Alert } from "react-native";
import * as Haptics from "expo-haptics";
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
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from "@/hooks/useTodo";
import { ScreenContainer, TodoItem, TodoModal } from "@/components";
import { Todo } from "@/types";

export default function TodosScreen() {
  const { data: todos = [], isLoading, refetch } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  };

  const handleToggle = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    updateTodo.mutate({ id, updates: { isCompleted: !todo.isCompleted } });
  };

  const handleEdit = (todo: Todo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingTodo(todo);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteTodo.mutate(id);
  };

  const handleSave = async (
    data: Omit<Todo, "id" | "createdAt" | "createdBy">
  ) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const activeTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

  return (
    <ScreenContainer title="To-Do Reminders">
      <YStack flex={1} backgroundColor="$bg">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
                borderRadius="$7"
                width={44}
                height={44}
                padding={0}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setModalVisible(true);
                }}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text color="white" fontSize={24} fontWeight="300">
                  +
                </Text>
              </Button>
            </XStack>

            {/* Loading State */}
            {isLoading ? (
              <YStack gap="$2" marginTop="$4">
                {[1, 2, 3].map((i) => (
                  <Stack
                    key={i}
                    backgroundColor="$background"
                    borderRadius="$6"
                    padding="$4"
                    height={80}
                  >
                    <Spinner size="small" />
                  </Stack>
                ))}
              </YStack>
            ) : todos.length === 0 ? (
              /* Empty State */
              <Stack
                flex={1}
                alignItems="center"
                justifyContent="center"
                paddingVertical="$10"
                gap="$4"
              >
                <Text fontSize={64}>✅</Text>
                <YStack gap="$2" alignItems="center">
                  <Text color="$color" fontSize={20} fontWeight="700">
                    No reminders yet
                  </Text>
                  <Text
                    color="$muted"
                    fontSize={15}
                    textAlign="center"
                    maxWidth={280}
                  >
                    Tap the + button to create your first reminder
                  </Text>
                </YStack>
                <Button
                  backgroundColor="$primary"
                  borderRadius="$6"
                  height={48}
                  paddingHorizontal="$6"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setModalVisible(true);
                  }}
                  pressStyle={{ opacity: 0.8 }}
                  marginTop="$2"
                >
                  <Text color="white" fontWeight="700" fontSize={16}>
                    Create Reminder
                  </Text>
                </Button>
              </Stack>
            ) : (
              /* Todos List */
              <YStack gap="$4">
                {/* Active Todos */}
                {activeTodos.length > 0 && (
                  <YStack gap="$2">
                    <Text color="$color" fontSize={16} fontWeight="700">
                      Active ({activeTodos.length})
                    </Text>
                    {activeTodos.map((todo) => (
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

                {/* Completed Todos */}
                {completedTodos.length > 0 && (
                  <YStack gap="$2">
                    <Text color="$muted" fontSize={16} fontWeight="700">
                      Completed ({completedTodos.length})
                    </Text>
                    {completedTodos.map((todo) => (
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

        {/* Todo Modal */}
        <TodoModal
          visible={modalVisible}
          todo={editingTodo}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      </YStack>
    </ScreenContainer>
  );
}
