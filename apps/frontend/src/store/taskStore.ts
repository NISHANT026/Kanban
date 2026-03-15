import { create } from "zustand";
import type {
  Task,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
} from "@kanban/types";
import { taskApi } from "../lib/api";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchTasks: (projectId: string, filters?: { sprintId?: string; epicId?: string }) => Promise<void>;
  addTask: (projectId: string, input: CreateTaskInput) => Promise<Task>;
  editTask: (projectId: string, taskId: string, input: UpdateTaskInput) => Promise<Task>;
  removeTask: (projectId: string, taskId: string) => Promise<void>;
  moveTask: (projectId: string, taskId: string, newStatus: TaskStatus) => Promise<void>;

  /** Used by socket events to patch local state without API calls */
  upsertTask: (task: Task) => void;
  removeTaskLocal: (taskId: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (projectId, filters) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskApi.list(projectId, filters);
      set({ tasks, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  addTask: async (projectId, input) => {
    const task = await taskApi.create(projectId, input);
    set((s) => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  editTask: async (projectId, taskId, input) => {
    const task = await taskApi.update(projectId, taskId, input);
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? task : t)) }));
    return task;
  },

  removeTask: async (projectId, taskId) => {
    await taskApi.delete(projectId, taskId);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
  },

  /** Optimistic drag: update status locally, then sync to server */
  moveTask: async (projectId, taskId, newStatus) => {
    const prev = get().tasks;
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t,
      ),
    }));
    try {
      await taskApi.update(projectId, taskId, { status: newStatus });
    } catch {
      set({ tasks: prev });
    }
  },

  upsertTask: (task) => {
    set((s) => {
      const idx = s.tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const copy = [...s.tasks];
        copy[idx] = task;
        return { tasks: copy };
      }
      return { tasks: [task, ...s.tasks] };
    });
  },

  removeTaskLocal: (taskId) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
  },
}));
