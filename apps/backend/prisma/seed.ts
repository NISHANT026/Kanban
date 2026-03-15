import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean slate
  await prisma.task.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.epic.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ───────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.create({
    data: { name: "Alice Johnson", email: "alice@example.com", passwordHash },
  });
  const bob = await prisma.user.create({
    data: { name: "Bob Smith", email: "bob@example.com", passwordHash },
  });
  const charlie = await prisma.user.create({
    data: { name: "Charlie Brown", email: "charlie@example.com", passwordHash },
  });

  // ─── Project ─────────────────────────────────────────────────────
  const project = await prisma.project.create({
    data: {
      name: "Engineering",
      key: "ENG",
      description: "Main engineering project for the Kanban board application.",
      createdById: alice.id,
      members: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bob.id, role: "MEMBER" },
          { userId: charlie.id, role: "MEMBER" },
        ],
      },
    },
  });

  // ─── Epics ───────────────────────────────────────────────────────
  const infraEpic = await prisma.epic.create({
    data: {
      title: "Infrastructure Setup",
      description: "Set up the core project infrastructure and tooling.",
      projectId: project.id,
    },
  });
  const uiEpic = await prisma.epic.create({
    data: {
      title: "Board UI",
      description: "Build the Kanban board user interface.",
      projectId: project.id,
    },
  });

  // ─── Sprints ─────────────────────────────────────────────────────
  const sprint1 = await prisma.sprint.create({
    data: {
      name: "Sprint 1",
      projectId: project.id,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-14"),
      status: "COMPLETED",
    },
  });
  const sprint2 = await prisma.sprint.create({
    data: {
      name: "Sprint 2",
      projectId: project.id,
      startDate: new Date("2026-03-15"),
      endDate: new Date("2026-03-28"),
      status: "ACTIVE",
    },
  });

  // ─── Tasks ───────────────────────────────────────────────────────
  const tasks = [
    {
      title: "Set up project repository",
      description: "Initialize the monorepo with npm workspaces and configure TypeScript.",
      status: "DONE" as const,
      priority: "HIGH" as const,
      storyPoints: 3,
      assigneeId: alice.id,
      epicId: infraEpic.id,
      sprintId: sprint1.id,
    },
    {
      title: "Design database schema",
      description: "Create Prisma schema with all models including relations.",
      status: "DONE" as const,
      priority: "HIGH" as const,
      storyPoints: 5,
      assigneeId: bob.id,
      epicId: infraEpic.id,
      sprintId: sprint1.id,
    },
    {
      title: "Implement REST API",
      description: "Build Express routes for CRUD operations on all entities.",
      status: "REVIEW" as const,
      priority: "HIGH" as const,
      storyPoints: 8,
      assigneeId: alice.id,
      epicId: infraEpic.id,
      sprintId: sprint2.id,
    },
    {
      title: "Build Kanban board UI",
      description: "Create the board layout with columns for each status.",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      storyPoints: 8,
      assigneeId: charlie.id,
      epicId: uiEpic.id,
      sprintId: sprint2.id,
    },
    {
      title: "Add drag and drop",
      description: "Integrate @dnd-kit for moving tasks between columns.",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      storyPoints: 5,
      assigneeId: charlie.id,
      epicId: uiEpic.id,
      sprintId: sprint2.id,
    },
    {
      title: "Add user authentication",
      description: "Implement JWT-based auth with login and registration.",
      status: "TODO" as const,
      priority: "HIGH" as const,
      storyPoints: 8,
      assigneeId: bob.id,
      epicId: infraEpic.id,
      sprintId: sprint2.id,
    },
    {
      title: "Write unit tests",
      description: "Add tests for API endpoints and critical frontend components.",
      status: "BACKLOG" as const,
      priority: "MEDIUM" as const,
      storyPoints: 5,
      assigneeId: null,
      epicId: null,
      sprintId: null,
    },
    {
      title: "Performance optimization",
      description: "Profile and optimize database queries and frontend rendering.",
      status: "BACKLOG" as const,
      priority: "LOW" as const,
      storyPoints: 3,
      assigneeId: null,
      epicId: null,
      sprintId: null,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        projectId: project.id,
        createdById: alice.id,
      },
    });
  }

  console.log("Seeded: 3 users, 1 project, 2 epics, 2 sprints, 8 tasks");
  console.log("Login: alice@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
