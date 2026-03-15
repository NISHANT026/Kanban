import * as taskRepo from "../repositories/task.repository.js";
import type { CreateTaskInput, UpdateTaskInput } from "@kanban/types";

export function getProjectTasks(
  projectId: string,
  filters?: { sprintId?: string; epicId?: string; status?: string },
) {
  return taskRepo.findByProject(projectId, filters);
}

export function getTaskById(id: string) {
  return taskRepo.findById(id);
}

export function createTask(projectId: string, createdById: string, input: CreateTaskInput) {
  return taskRepo.create({
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    storyPoints: input.storyPoints,
    project: { connect: { id: projectId } },
    createdBy: { connect: { id: createdById } },
    ...(input.assigneeId && { assignee: { connect: { id: input.assigneeId } } }),
    ...(input.epicId && { epic: { connect: { id: input.epicId } } }),
    ...(input.sprintId && { sprint: { connect: { id: input.sprintId } } }),
  });
}

export function updateTask(id: string, input: UpdateTaskInput) {
  const data: Record<string, unknown> = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.status !== undefined) data.status = input.status;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.storyPoints !== undefined) data.storyPoints = input.storyPoints;

  if (input.assigneeId !== undefined) {
    data.assignee = input.assigneeId
      ? { connect: { id: input.assigneeId } }
      : { disconnect: true };
  }
  if (input.epicId !== undefined) {
    data.epic = input.epicId
      ? { connect: { id: input.epicId } }
      : { disconnect: true };
  }
  if (input.sprintId !== undefined) {
    data.sprint = input.sprintId
      ? { connect: { id: input.sprintId } }
      : { disconnect: true };
  }

  return taskRepo.update(id, data);
}

export function deleteTask(id: string) {
  return taskRepo.remove(id);
}
