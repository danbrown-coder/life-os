import { create } from "zustand";
import type { DomainCategory } from "@/lib/db/types";

export type DraftGoal = {
  id: string;
  category: DomainCategory;
  title: string;
  description?: string;
  current_level?: string;
  target_date?: string;
};

export type DraftConstraint = {
  id: string;
  type: string;
  description: string;
};

export type DraftCommitment = {
  id: string;
  title: string;
  category?: DomainCategory;
  start_time?: string;
  end_time?: string;
  rrule?: string;
  notes?: string;
};

type OnboardingState = {
  display_name: string;
  wake_time: string;
  sleep_time: string;
  timezone: string;
  goals: DraftGoal[];
  priorities: string[]; // ranked goal ids
  constraints: DraftConstraint[];
  food_preferences: string;
  cooking_ability: string;
  budget: string;
  commitments: DraftCommitment[];

  set: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
  addGoal: (g: DraftGoal) => void;
  removeGoal: (id: string) => void;
  reorderPriorities: (ids: string[]) => void;
  addConstraint: (c: DraftConstraint) => void;
  removeConstraint: (id: string) => void;
  addCommitment: (c: DraftCommitment) => void;
  removeCommitment: (id: string) => void;
  reset: () => void;
};

const initial = {
  display_name: "",
  wake_time: "06:30",
  sleep_time: "22:30",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  goals: [] as DraftGoal[],
  priorities: [] as string[],
  constraints: [] as DraftConstraint[],
  food_preferences: "",
  cooking_ability: "",
  budget: "",
  commitments: [] as DraftCommitment[],
};

export const useOnboarding = create<OnboardingState>((set) => ({
  ...initial,
  set: (k, v) => set({ [k]: v } as never),
  addGoal: (g) =>
    set((s) => ({ goals: [...s.goals, g], priorities: [...s.priorities, g.id] })),
  removeGoal: (id) =>
    set((s) => ({
      goals: s.goals.filter((g) => g.id !== id),
      priorities: s.priorities.filter((p) => p !== id),
    })),
  reorderPriorities: (ids) => set({ priorities: ids }),
  addConstraint: (c) => set((s) => ({ constraints: [...s.constraints, c] })),
  removeConstraint: (id) =>
    set((s) => ({ constraints: s.constraints.filter((c) => c.id !== id) })),
  addCommitment: (c) => set((s) => ({ commitments: [...s.commitments, c] })),
  removeCommitment: (id) =>
    set((s) => ({ commitments: s.commitments.filter((c) => c.id !== id) })),
  reset: () => set(initial),
}));
