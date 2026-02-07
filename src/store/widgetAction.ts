import { create } from "zustand";

interface WidgetActionState {
  pendingNudge: boolean;
  triggerNudge: () => void;
  clearNudge: () => void;
}

export const useWidgetActionStore = create<WidgetActionState>((set) => ({
  pendingNudge: false,
  triggerNudge: () => set({ pendingNudge: true }),
  clearNudge: () => set({ pendingNudge: false }),
}));
