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
import { MoodService } from "@/services/mood/mood.service";
import { MoodEntry, MoodLevel } from "@/types";
import { useProfileStore } from "@/store/profile";
import { getCurrentUserId } from "@/services/auth/auth.service";

type CreateMoodPayload = {
  level: MoodLevel;
  note?: string;
  isPrivate?: boolean;
};

type UpdateMoodPayload = {
  id: string;
  updates: {
    level?: MoodLevel;
    note?: string;
    isPrivate?: boolean;
  };
};

const moodKey = (pairId?: string) => ["moods", pairId || "none"] as const;
const partnerMoodKey = (pairId?: string) =>
  ["partnerMood", pairId || "none"] as const;
const todayMoodKey = (pairId?: string) =>
  ["todayMood", pairId || "none"] as const;

/**
 * Get user's mood entries with real-time updates
 */
export function useMoodEntries() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();
  const uid = getCurrentUserId();

  // Set up real-time listener
  useEffect(() => {
    if (!pairId || !uid) return;

    const q = query(
      collection(db, "pairs", pairId, "moods"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const moods: MoodEntry[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            userId: String(data.userId ?? ""),
            pairId: String(data.pairId ?? pairId),
            level: (data.level as MoodLevel) || 3,
            note: data.note ? String(data.note) : undefined,
            isPrivate: Boolean(data.isPrivate),
            createdAt: Number(data.createdAt ?? 0),
            updatedAt: data.updatedAt ? Number(data.updatedAt) : undefined,
          };
        });

        qc.setQueryData<MoodEntry[]>(moodKey(pairId), moods);
      },
      (error) => {
        console.error("❌ [useMoodEntries] Listener error:", error);
      }
    );

    return () => unsubscribe();
  }, [pairId, uid, qc]);

  return useQuery({
    queryKey: moodKey(pairId),
    queryFn: () => MoodService.listByUser(),
    enabled: !!pairId && !!uid,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

/**
 * Get partner's latest shared mood
 */
export function usePartnerMood() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();
  const uid = getCurrentUserId();

  // Set up real-time listener for partner's moods
  useEffect(() => {
    if (!pairId || !uid) return;

    // Note: Firestore doesn't support != with orderBy on different field
    // So we'll fetch all non-private moods and filter client-side
    const q = query(
      collection(db, "pairs", pairId, "moods"),
      where("isPrivate", "==", false),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const partnerMoods = snapshot.docs
          .map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              userId: String(data.userId ?? ""),
              pairId: String(data.pairId ?? pairId),
              level: (data.level as MoodLevel) || 3,
              note: data.note ? String(data.note) : undefined,
              isPrivate: Boolean(data.isPrivate),
              createdAt: Number(data.createdAt ?? 0),
              updatedAt: data.updatedAt ? Number(data.updatedAt) : undefined,
            } as MoodEntry;
          })
          .filter((m) => m.userId !== uid);

        // Get the latest partner mood
        const latestPartnerMood = partnerMoods[0] || null;
        qc.setQueryData<MoodEntry | null>(
          partnerMoodKey(pairId),
          latestPartnerMood
        );
      },
      (error) => {
        console.error("❌ [usePartnerMood] Listener error:", error);
      }
    );

    return () => unsubscribe();
  }, [pairId, uid, qc]);

  return useQuery({
    queryKey: partnerMoodKey(pairId),
    queryFn: async () => {
      const { partner } = await MoodService.getLatestMoods();
      return partner || null;
    },
    enabled: !!pairId && !!uid,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

/**
 * Get today's mood for quick update check
 */
export function useTodayMood() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const uid = getCurrentUserId();

  return useQuery({
    queryKey: todayMoodKey(pairId),
    queryFn: () => MoodService.getTodaysMood(),
    enabled: !!pairId && !!uid,
    staleTime: 60_000, // 1 minute
    refetchOnMount: "always",
  });
}

/**
 * Create new mood entry
 */
export function useCreateMood() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMoodPayload) => MoodService.create(payload),
    onSuccess: () => {
      // Invalidate queries to refetch
      qc.invalidateQueries({ queryKey: moodKey(pairId) });
      qc.invalidateQueries({ queryKey: todayMoodKey(pairId) });
    },
    onError: (error) => {
      console.error("❌ [useCreateMood] Error:", error);
    },
  });
}

/**
 * Update existing mood entry
 */
export function useUpdateMood() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: UpdateMoodPayload) =>
      MoodService.update(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moodKey(pairId) });
      qc.invalidateQueries({ queryKey: todayMoodKey(pairId) });
    },
    onError: (error) => {
      console.error("❌ [useUpdateMood] Error:", error);
    },
  });
}

/**
 * Delete mood entry
 */
export function useDeleteMood() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => MoodService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moodKey(pairId) });
      qc.invalidateQueries({ queryKey: todayMoodKey(pairId) });
    },
    onError: (error) => {
      console.error("❌ [useDeleteMood] Error:", error);
    },
  });
}
