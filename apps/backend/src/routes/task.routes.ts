import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireProjectMember } from "../middleware/projectAuth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createTaskSchema, updateTaskSchema } from "../validation/task.js";
import * as taskService from "../services/task.service.js";
import { emitTaskEvent } from "../lib/socket.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", requireProjectMember(), asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.getProjectTasks(
    req.params.projectId as string,
    {
      sprintId: req.query.sprintId as string | undefined,
      epicId: req.query.epicId as string | undefined,
      status: req.query.status as string | undefined,
    },
  );
  res.json({ data: tasks });
}));

router.post("/", requireProjectMember(), validate(createTaskSchema), asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;
  const task = await taskService.createTask(projectId, req.userId!, req.body);
  emitTaskEvent(projectId, "task:created", task, req.userId);
  res.status(201).json({ data: task });
}));

router.patch("/:taskId", requireProjectMember(), validate(updateTaskSchema), asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;
  const task = await taskService.updateTask(req.params.taskId as string, req.body);
  emitTaskEvent(projectId, "task:updated", task, req.userId);
  res.json({ data: task });
}));

router.delete("/:taskId", requireProjectMember(), asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.projectId as string;
  const taskId = req.params.taskId as string;
  await taskService.deleteTask(taskId);
  emitTaskEvent(projectId, "task:deleted", taskId, req.userId);
  res.json({ message: "Task deleted" });
}));

export default router;
