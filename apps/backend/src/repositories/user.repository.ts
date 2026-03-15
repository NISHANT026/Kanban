import { prisma } from "../lib/prisma.js";

export function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function create(data: { name: string; email: string; passwordHash: string }) {
  return prisma.user.create({
    data,
    select: { id: true, name: true, email: true, createdAt: true },
  });
}
