import { prisma } from "../lib/prisma.js";
import type { SprintStatus } from "@kanban/types";

export function findByProjectId(projectId: string) {
  return prisma.sprint.findMany({
    where: { projectId },
    orderBy: { startDate: "desc" },
    include: { _count: { select: { tasks: true } } },
  });
}

export function findById(id: string) {
  return prisma.sprint.findUnique({ where: { id } });
}

export function findActive(projectId: string) {
  return prisma.sprint.findFirst({
    where: { projectId, status: "ACTIVE" },
  });
}

export function create(data: {
  name: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
}) {
  return prisma.sprint.create({ data });
}

export function update(
  id: string,
  data: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    status?: SprintStatus;
  },
) {
  return prisma.sprint.update({ where: { id }, data });
}

export function remove(id: string) {
  return prisma.sprint.delete({ where: { id } });
}
