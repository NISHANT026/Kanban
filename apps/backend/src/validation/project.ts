import { z } from "zod";
import { MEMBER_ROLES } from "@kanban/types";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  key: z
    .string()
    .min(2, "Key must be 2-10 characters")
    .max(10)
    .regex(/^[A-Z][A-Z0-9]*$/, "Key must be uppercase alphanumeric, starting with a letter"),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(MEMBER_ROLES).optional(),
});
