import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SessionState = {
  deviceId?: string;
  pairId?: string | null;
  setDeviceId: (id: string) => void;
  setPairId: (id: string | null) => void;
};

export const useSession = create<SessionState>((set) => ({
  deviceId: undefined,
  pairId: null,
  setDeviceId: (deviceId) => set({ deviceId }),
  setPairId: (pairId) => set({ pairId }),
}));

// Later we will add hydration from AsyncStorage and anonymous auth hookup.