import { create } from "zustand";
import { User } from "firebase/auth";

type AuthState = {
  uid: any;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  uid: null,
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) =>
    set({
      user,
      uid: user ? user.uid : null,
      loading: false,
    }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  signOut: () => set({ user: null, uid: null, loading: false }),
}));
