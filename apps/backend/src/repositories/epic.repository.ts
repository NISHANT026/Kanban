import { prisma } from "../lib/prisma.js";

export function findByProjectId(projectId: string) {
  return prisma.epic.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tasks: true } } },
  });
}

export function findById(id: string) {
  return prisma.epic.findUnique({ where: { id } });
}

export function create(data: { title: string; description?: string; projectId: string }) {
  return prisma.epic.create({ data });
}

export function update(id: string, data: { title?: string; description?: string | null }) {
  return prisma.epic.update({ where: { id }, data });
}

export function remove(id: string) {
  return prisma.epic.delete({ where: { id } });
}
