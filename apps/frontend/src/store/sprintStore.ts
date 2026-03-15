import { create } from "zustand";
import type { Sprint, CreateSprintInput, UpdateSprintInput } from "@kanban/types";
import { sprintApi } from "../lib/api";

interface SprintState {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  selectedSprintId: string | null;

  fetchSprints: (projectId: string) => Promise<void>;
  createSprint: (projectId: string, input: CreateSprintInput) => Promise<Sprint>;
  updateSprint: (projectId: string, sprintId: string, input: UpdateSprintInput) => Promise<Sprint>;
  selectSprint: (sprintId: string | null) => void;
}

export const useSprintStore = create<SprintState>((set) => ({
  sprints: [],
  activeSprint: null,
  selectedSprintId: null,

  fetchSprints: async (projectId) => {
    set({ sprints: [], activeSprint: null, selectedSprintId: null });
    const sprints = await sprintApi.list(projectId);
    const activeSprint = sprints.find((s) => s.status === "ACTIVE") ?? null;
    set({ sprints, activeSprint, selectedSprintId: activeSprint?.id ?? null });
  },

  createSprint: async (projectId, input) => {
    const sprint = await sprintApi.create(projectId, input);
    set((s) => ({ sprints: [sprint, ...s.sprints] }));
    return sprint;
  },

  updateSprint: async (projectId, sprintId, input) => {
    const sprint = await sprintApi.update(projectId, sprintId, input);
    set((s) => ({
      sprints: s.sprints.map((sp) => (sp.id === sprintId ? sprint : sp)),
      activeSprint: sprint.status === "ACTIVE" ? sprint : s.activeSprint,
    }));
    return sprint;
  },

  selectSprint: (sprintId) => set({ selectedSprintId: sprintId }),
}));
