import { create } from "zustand";
import type { Project, ProjectMember, CreateProjectInput, AddMemberInput } from "@kanban/types";
import { projectApi } from "../lib/api";

interface ProjectState {
  projects: Project[];
  currentProject: (Project & { members: ProjectMember[] }) | null;
  isLoading: boolean;

  fetchProjects: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  addMember: (projectId: string, input: AddMemberInput) => Promise<ProjectMember>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    const projects = await projectApi.list();
    set({ projects, isLoading: false });
  },

  selectProject: async (id) => {
    set({ isLoading: true });
    const project = await projectApi.get(id);
    set({ currentProject: project, isLoading: false });
  },

  createProject: async (input) => {
    const project = await projectApi.create(input);
    set((s) => ({ projects: [project, ...s.projects] }));
    return project;
  },

  addMember: async (projectId, input) => {
    const member = await projectApi.addMember(projectId, input);
    set((s) => {
      if (!s.currentProject || s.currentProject.id !== projectId) return s;
      return { currentProject: { ...s.currentProject, members: [...s.currentProject.members, member] } };
    });
    return member;
  },

  removeMember: async (projectId, userId) => {
    await projectApi.removeMember(projectId, userId);
    set((s) => {
      if (!s.currentProject || s.currentProject.id !== projectId) return s;
      return { currentProject: { ...s.currentProject, members: s.currentProject.members.filter((m) => m.userId !== userId) } };
    });
  },

  clearCurrent: () => set({ currentProject: null }),
}));
