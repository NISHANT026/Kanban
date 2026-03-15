import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireProjectMember } from "../middleware/projectAuth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createSprintSchema, updateSprintSchema } from "../validation/sprint.js";
import * as sprintRepo from "../repositories/sprint.repository.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", requireProjectMember(), asyncHandler(async (req: Request, res: Response) => {
  const sprints = await sprintRepo.findByProjectId(req.params.projectId as string);
  res.json({ data: sprints });
}));

router.post(
  "/",
  requireProjectMember("ADMIN"),
  validate(createSprintSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const sprint = await sprintRepo.create({
      name: req.body.name,
      projectId: req.params.projectId as string,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    });
    res.status(201).json({ data: sprint });
  }),
);

router.patch(
  "/:sprintId",
  requireProjectMember("ADMIN"),
  validate(updateSprintSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const data: Record<string, unknown> = {};
    if (req.body.name) data.name = req.body.name;
    if (req.body.startDate) data.startDate = new Date(req.body.startDate);
    if (req.body.endDate) data.endDate = new Date(req.body.endDate);
    if (req.body.status) data.status = req.body.status;

    const sprint = await sprintRepo.update(req.params.sprintId as string, data);
    res.json({ data: sprint });
  }),
);

router.delete(
  "/:sprintId",
  requireProjectMember("ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    await sprintRepo.remove(req.params.sprintId as string);
    res.json({ message: "Sprint deleted" });
  }),
);

export default router;
