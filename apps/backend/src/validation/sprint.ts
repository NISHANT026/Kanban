import { z } from "zod";
import { SPRINT_STATUSES } from "@kanban/types";

export const createSprintSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  startDate: z.string().datetime({ message: "Invalid start date" }),
  endDate: z.string().datetime({ message: "Invalid end date" }),
});

export const updateSprintSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(SPRINT_STATUSES).optional(),
});
