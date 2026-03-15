import { create } from "zustand";
import type { Epic, CreateEpicInput } from "@kanban/types";
import { epicApi } from "../lib/api";

interface EpicState {
  epics: Epic[];
  selectedEpicId: string | null;

  fetchEpics: (projectId: string) => Promise<void>;
  createEpic: (projectId: string, input: CreateEpicInput) => Promise<Epic>;
  selectEpic: (epicId: string | null) => void;
}

export const useEpicStore = create<EpicState>((set) => ({
  epics: [],
  selectedEpicId: null,

  fetchEpics: async (projectId) => {
    set({ epics: [], selectedEpicId: null });
    const epics = await epicApi.list(projectId);
    set({ epics });
  },

  createEpic: async (projectId, input) => {
    const epic = await epicApi.create(projectId, input);
    set((s) => ({ epics: [epic, ...s.epics] }));
    return epic;
  },

  selectEpic: (epicId) => set({ selectedEpicId: epicId }),
}));
