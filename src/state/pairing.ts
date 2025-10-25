import { create } from 'zustand';

export type PairingStatus = 'unpaired' | 'pairing' | 'paired' | 'error';

type PairingState = {
  status: PairingStatus;
  pairId?: string;
  myCode?: string;
  expiresAt?: number; // epoch ms
  error?: string;

  setStatus: (s: PairingStatus) => void;
  setPairId: (id?: string) => void;
  setCode: (code?: string, expiresAt?: number) => void;
  setError: (msg?: string) => void;
  reset: () => void;
};

export const usePairingStore = create<PairingState>((set) => ({
  status: 'unpaired',
  pairId: undefined,
  myCode: undefined,
  expiresAt: undefined,
  error: undefined,
  setStatus: (status) => set({ status }),
  setPairId: (pairId) => set({ pairId }),
  setCode: (myCode, expiresAt) => set({ myCode, expiresAt }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      status: 'unpaired',
      pairId: undefined,
      myCode: undefined,
      expiresAt: undefined,
      error: undefined,
    }),
}));