import { z } from "zod";
import { TASK_STATUSES, TASK_PRIORITIES, STORY_POINTS } from "@kanban/types";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  storyPoints: z.number().refine((v) => (STORY_POINTS as readonly number[]).includes(v), {
    message: "Story points must be one of: 1, 2, 3, 5, 8, 13",
  }).nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  epicId: z.string().uuid().nullable().optional(),
  sprintId: z.string().uuid().nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  storyPoints: z.number().refine((v) => (STORY_POINTS as readonly number[]).includes(v), {
    message: "Story points must be one of: 1, 2, 3, 5, 8, 13",
  }).nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  epicId: z.string().uuid().nullable().optional(),
  sprintId: z.string().uuid().nullable().optional(),
});
