import { prisma } from "../lib/prisma.js";
import type { MemberRole } from "@kanban/types";

export function findByUserId(userId: string) {
  return prisma.project.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "desc" },
  });
}

export function findById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { members: { include: { user: { select: { id: true, name: true, email: true, createdAt: true } } } } },
  });
}

export function findByKey(key: string) {
  return prisma.project.findUnique({ where: { key } });
}

export function create(data: {
  name: string;
  key: string;
  description?: string;
  createdById: string;
}) {
  return prisma.project.create({
    data: {
      ...data,
      members: {
        create: { userId: data.createdById, role: "ADMIN" },
      },
    },
  });
}

export function update(id: string, data: { name?: string; description?: string | null }) {
  return prisma.project.update({ where: { id }, data });
}

export function remove(id: string) {
  return prisma.project.delete({ where: { id } });
}

export function getMemberRole(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

export function addMember(projectId: string, userId: string, role: MemberRole = "MEMBER") {
  return prisma.projectMember.create({
    data: { projectId, userId, role },
    include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
  });
}

export function removeMember(projectId: string, userId: string) {
  return prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
}
