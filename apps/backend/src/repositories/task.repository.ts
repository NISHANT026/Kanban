import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";

const TASK_INCLUDE = {
  assignee: { select: { id: true, name: true, email: true, createdAt: true } },
  epic: true,
  sprint: true,
  createdBy: { select: { id: true, name: true, email: true, createdAt: true } },
} satisfies Prisma.TaskInclude;

export function findByProject(
  projectId: string,
  filters?: { sprintId?: string; epicId?: string; status?: string },
) {
  const where: Prisma.TaskWhereInput = { projectId };
  if (filters?.sprintId) where.sprintId = filters.sprintId;
  if (filters?.epicId) where.epicId = filters.epicId;
  if (filters?.status) where.status = filters.status as Prisma.EnumTaskStatusFilter;

  return prisma.task.findMany({
    where,
    include: TASK_INCLUDE,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export function findById(id: string) {
  return prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE });
}

export function create(data: Prisma.TaskCreateInput) {
  return prisma.task.create({ data, include: TASK_INCLUDE });
}

export function update(id: string, data: Prisma.TaskUpdateInput) {
  return prisma.task.update({ where: { id }, data, include: TASK_INCLUDE });
}

export function remove(id: string) {
  return prisma.task.delete({ where: { id } });
}
