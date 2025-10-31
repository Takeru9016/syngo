// src/services/todos/useTodos.ts
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { TodoService } from "@/services/todo/todo.service";
import { Todo, TodoPriority } from "@/types";
import { useProfileStore } from "@/store/profile";

type CreatePayload = {
  title: string;
  description: string;
  dueDate: number;
  priority: TodoPriority;
};

type UpdatePayload = {
  id: string;
  updates: Partial<Omit<Todo, "id" | "createdBy" | "createdAt">>;
};

const key = (pairId?: string) => ["todos", pairId || "none"] as const;

export function useTodos() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();

  console.log("🔄 [useTodos] Hook called with pairId:", pairId);

  // Set up real-time listener
  useEffect(() => {
    if (!pairId) {
      console.log("⚠️ [useTodos] No pairId, skipping listener");
      return;
    }

    console.log(
      "👂 [useTodos] Setting up real-time listener for pairId:",
      pairId
    );

    const q = query(
      collection(db, "todos"),
      where("pairId", "==", pairId),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "🔔 [useTodos] Real-time update received:",
          snapshot.docs.length,
          "todos"
        );

        const todos: Todo[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: String(data.title ?? ""),
            description: String(data.description ?? ""),
            dueDate: Number(data.dueDate ?? 0),
            isCompleted: Boolean(data.isCompleted),
            priority: (data.priority as TodoPriority) || "medium",
            createdBy: String(data.createdBy ?? ""),
            createdAt: Number(data.createdAt ?? 0),
          };
        });

        // Update React Query cache directly
        qc.setQueryData<Todo[]>(key(pairId), todos);
      },
      (error) => {
        console.error("❌ [useTodos] Listener error:", error);
      }
    );

    return () => {
      console.log("🔌 [useTodos] Unsubscribing from real-time listener");
      unsubscribe();
    };
  }, [pairId, qc]);

  return useQuery({
    queryKey: key(pairId),
    queryFn: () => {
      console.log("🔄 [useTodos] Query function executing for pairId:", pairId);
      return TodoService.listByPair();
    },
    enabled: !!pairId,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  const pairId = useProfileStore.getState().profile?.pairId;

  return useMutation({
    mutationFn: (payload: CreatePayload) => {
      console.log("➕ [useCreateTodo] Mutation called with:", payload);
      return TodoService.create(payload);
    },
    onSuccess: async (newId) => {
      console.log("✅ [useCreateTodo] Success, created ID:", newId);
      // Real-time listener will handle the update automatically
    },
    onError: (error) => {
      console.error("❌ [useCreateTodo] Error:", error);
    },
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  const pairId = useProfileStore.getState().profile?.pairId;

  return useMutation({
    mutationFn: ({ id, updates }: UpdatePayload) => {
      console.log(
        "✏️ [useUpdateTodo] Mutation called for id:",
        id,
        "updates:",
        updates
      );

      // Reject optimistic IDs immediately
      if (id.startsWith("optimistic-")) {
        console.error(
          "❌ [useUpdateTodo] Attempted to update optimistic ID:",
          id
        );
        throw new Error("Cannot update optimistic item. Please wait for sync.");
      }

      // Strip forbidden fields defensively
      const { createdAt, createdBy, id: _ignore, ...safe } = updates as any;

      console.log("✏️ [useUpdateTodo] Safe updates after stripping:", safe);
      return TodoService.update(id, safe);
    },
    onMutate: async ({ id, updates }) => {
      console.log("⏳ [useUpdateTodo] onMutate for id:", id, "pairId:", pairId);
      if (!pairId) return;

      // Don't optimistically update if it's an optimistic ID
      if (id.startsWith("optimistic-")) {
        console.warn(
          "⚠️ [useUpdateTodo] Skipping optimistic update for optimistic ID"
        );
        return;
      }

      await qc.cancelQueries({ queryKey: key(pairId) });

      const prev = qc.getQueryData<Todo[]>(key(pairId)) || [];
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      qc.setQueryData<Todo[]>(key(pairId), next);

      return { prev };
    },
    onError: (error, _vars, ctx) => {
      console.error("❌ [useUpdateTodo] Error:", error);
      if (!pairId) return;
      if (ctx?.prev) qc.setQueryData<Todo[]>(key(pairId), ctx.prev);
    },
    onSuccess: (_, vars) => {
      console.log("✅ [useUpdateTodo] Success for id:", vars.id);
      // Real-time listener will handle the update automatically
    },
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  const pairId = useProfileStore.getState().profile?.pairId;

  return useMutation({
    mutationFn: (id: string) => {
      console.log("🗑️ [useDeleteTodo] Mutation called for id:", id);

      // Reject optimistic IDs immediately
      if (id.startsWith("optimistic-")) {
        console.error(
          "❌ [useDeleteTodo] Attempted to delete optimistic ID:",
          id
        );
        throw new Error("Cannot delete optimistic item. Please wait for sync.");
      }

      return TodoService.remove(id);
    },
    onMutate: async (id) => {
      console.log("⏳ [useDeleteTodo] onMutate for id:", id, "pairId:", pairId);
      if (!pairId) return;

      // Don't optimistically delete if it's an optimistic ID
      if (id.startsWith("optimistic-")) {
        console.warn(
          "⚠️ [useDeleteTodo] Skipping optimistic delete for optimistic ID"
        );
        return;
      }

      await qc.cancelQueries({ queryKey: key(pairId) });

      const prev = qc.getQueryData<Todo[]>(key(pairId)) || [];
      const next = prev.filter((t) => t.id !== id);
      qc.setQueryData<Todo[]>(key(pairId), next);

      return { prev };
    },
    onError: (error, _vars, ctx) => {
      console.error("❌ [useDeleteTodo] Error:", error);
      if (!pairId) return;
      if (ctx?.prev) qc.setQueryData<Todo[]>(key(pairId), ctx.prev);
    },
    onSuccess: (_, id) => {
      console.log("✅ [useDeleteTodo] Success for id:", id);
      // Real-time listener will handle the update automatically
    },
  });
}
