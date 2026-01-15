import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "@/services/auth/auth.service";
import {
  Todo,
  TodoPriority,
  ListItemType,
  DreamCategory,
  Subtask,
} from "@/types";
import { useProfileStore } from "@/store/profile";
import { notifyPartner } from "@/services/notification/notifyPartner";

type CreateTodoInput = {
  title: string;
  description: string;
  dueDate?: number; // Optional for dreams
  priority: TodoPriority;
  // Together List fields
  listType?: ListItemType;
  subtasks?: Subtask[];
  category?: DreamCategory;
  photos?: string[];
};

type UpdateTodoInput = Partial<Omit<Todo, "id" | "createdBy" | "createdAt">>;

function nowMs(): number {
  return Date.now();
}

function requirePairId(): string {
  const profile = useProfileStore.getState().profile;

  const pairId = profile?.pairId;
  if (!pairId) {
    console.error("❌ [TodoService] No pairId found in profile");
    throw new Error("Pair not established");
  }

  return pairId;
}

export const TodoService = {
  async listByPair(): Promise<Todo[]> {
    const pairId = requirePairId();
    const _uid = getCurrentUserId();

    const q = query(
      collection(db, "todos"),
      where("pairId", "==", pairId),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const snap = await getDocs(q);

    const todos = snap.docs.map((d) => {
      const data = d.data() as any;

      const todo: Todo = {
        id: d.id,
        title: String(data.title ?? ""),
        description: String(data.description ?? ""),
        dueDate: data.dueDate ? Number(data.dueDate) : undefined,
        isCompleted: Boolean(data.isCompleted),
        priority: (data.priority as TodoPriority) || "medium",
        createdBy: String(data.createdBy ?? ""),
        createdAt: Number(data.createdAt ?? 0),
        // Together List fields
        listType: (data.listType as ListItemType) || "task",
        subtasks: Array.isArray(data.subtasks) ? data.subtasks : undefined,
        category: data.category as DreamCategory | undefined,
        photos: Array.isArray(data.photos) ? data.photos : undefined,
        completedDate: data.completedDate
          ? Number(data.completedDate)
          : undefined,
        completedPhotos: Array.isArray(data.completedPhotos)
          ? data.completedPhotos
          : undefined,
      };
      return todo;
    });

    return todos;
  },

  async create(input: CreateTodoInput): Promise<string> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("❌ [TodoService.create] Not authenticated");
      throw new Error("Not authenticated");
    }

    const pairId = useProfileStore.getState().profile?.pairId;
    if (!pairId) {
      console.error("❌ [TodoService.create] No pairId found");
      throw new Error("Not paired");
    }

    const payload: Record<string, any> = {
      title: input.title,
      description: input.description || "",
      isCompleted: false,
      priority: input.priority,
      createdBy: uid,
      pairId,
      createdAt: nowMs(),
      updatedAt: serverTimestamp(),
      // Together List fields
      listType: input.listType || "task",
    };

    // Only include dueDate if provided (tasks usually have it, dreams may not)
    if (input.dueDate !== undefined) {
      payload.dueDate = input.dueDate;
    }

    // Include subtasks (always for tasks to maintain consistency)
    if (input.subtasks !== undefined) {
      payload.subtasks = input.subtasks;
    }

    // Dream-specific fields
    if (input.category) {
      payload.category = input.category;
    }
    if (input.photos && input.photos.length > 0) {
      payload.photos = input.photos;
    }

    try {
      const ref = await addDoc(collection(db, "todos"), payload);

      // Send notification to partner
      await notifyPartner({
        type: "todo_created",
        title: "✅ New Todo",
        body: `${input.title}`,
        data: { todoId: ref.id },
      });

      return ref.id;
    } catch (error) {
      console.error("❌ [TodoService.create] Error:", error);
      throw error;
    }
  },

  async update(id: string, updates: UpdateTodoInput): Promise<void> {
    const pairId = requirePairId();
    const _uid = getCurrentUserId();

    const ref = doc(db, "todos", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.error("❌ [TodoService.update] Todo not found:", id);
        throw new Error("Todo not found");
      }

      const data = snap.data() as any;

      if (data.pairId !== pairId) {
        console.error(
          "❌ [TodoService.update] PairId mismatch. Doc pairId:",
          data.pairId,
          "Current pairId:",
          pairId
        );
        throw new Error("Forbidden: not in this pair");
      }

      const patch: Record<string, any> = { updatedAt: serverTimestamp() };
      if (updates.title !== undefined) patch.title = updates.title;
      if (updates.description !== undefined)
        patch.description = updates.description;
      if (updates.dueDate !== undefined) patch.dueDate = updates.dueDate;
      if (updates.isCompleted !== undefined)
        patch.isCompleted = updates.isCompleted;
      if (updates.priority !== undefined) patch.priority = updates.priority;
      // Together List fields
      if (updates.listType !== undefined) patch.listType = updates.listType;
      if (updates.subtasks !== undefined) patch.subtasks = updates.subtasks;
      if (updates.category !== undefined) patch.category = updates.category;
      if (updates.photos !== undefined) patch.photos = updates.photos;
      if (updates.completedDate !== undefined)
        patch.completedDate = updates.completedDate;
      if (updates.completedPhotos !== undefined)
        patch.completedPhotos = updates.completedPhotos;

      await updateDoc(ref, patch);
    } catch (error) {
      console.error("❌ [TodoService.update] Error updating todo:", error);
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const pairId = requirePairId();
    const _uid = getCurrentUserId();

    const ref = doc(db, "todos", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.warn("⚠️ [TodoService.remove] Todo not found:", id);
        return;
      }

      const data = snap.data() as any;

      if (data.pairId !== pairId) {
        console.error(
          "❌ [TodoService.remove] PairId mismatch. Doc pairId:",
          data.pairId,
          "Current pairId:",
          pairId
        );
        throw new Error("Forbidden: not in this pair");
      }

      await deleteDoc(ref);
    } catch (error) {
      console.error("❌ [TodoService.remove] Error deleting todo:", error);
      throw error;
    }
  },
};
