import { create } from "zustand";

export const DEMO_USER_ID = "demo-00000000-0000-0000-0000-000000000000";

interface DemoState {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

export const useDemoMode = create<DemoState>((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
}));

export function isDemoEnabled() {
  return useDemoMode.getState().enabled;
}
