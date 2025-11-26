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
import { Todo, TodoPriority } from "@/types";
import { useProfileStore } from "@/store/profile";
import { notifyPartner } from "@/services/notification/notifyPartner";

type CreateTodoInput = {
  title: string;
  description: string;
  dueDate: number;
  priority: TodoPriority;
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
    const uid = getCurrentUserId();



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
        dueDate: Number(data.dueDate ?? 0),
        isCompleted: Boolean(data.isCompleted),
        priority: (data.priority as TodoPriority) || "medium",
        createdBy: String(data.createdBy ?? ""),
        createdAt: Number(data.createdAt ?? 0),
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

    const payload = {
      title: input.title,
      description: input.description || "",
      dueDate: input.dueDate,
      isCompleted: false,
      priority: input.priority,
      createdBy: uid,
      pairId,
      createdAt: nowMs(),
      updatedAt: serverTimestamp(),
    };



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
    const uid = getCurrentUserId();



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



      await updateDoc(ref, patch);

    } catch (error) {
      console.error("❌ [TodoService.update] Error updating todo:", error);
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();



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
