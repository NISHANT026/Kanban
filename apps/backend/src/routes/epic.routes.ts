import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireProjectMember } from "../middleware/projectAuth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createEpicSchema, updateEpicSchema } from "../validation/epic.js";
import * as epicRepo from "../repositories/epic.repository.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", requireProjectMember(), asyncHandler(async (req: Request, res: Response) => {
  const epics = await epicRepo.findByProjectId(req.params.projectId as string);
  res.json({ data: epics });
}));

router.post("/", requireProjectMember(), validate(createEpicSchema), asyncHandler(async (req: Request, res: Response) => {
  const epic = await epicRepo.create({
    ...req.body,
    projectId: req.params.projectId as string,
  });
  res.status(201).json({ data: epic });
}));

router.patch("/:epicId", requireProjectMember(), validate(updateEpicSchema), asyncHandler(async (req: Request, res: Response) => {
  const epic = await epicRepo.update(req.params.epicId as string, req.body);
  res.json({ data: epic });
}));

router.delete("/:epicId", requireProjectMember(), asyncHandler(async (req: Request, res: Response) => {
  await epicRepo.remove(req.params.epicId as string);
  res.json({ message: "Epic deleted" });
}));

export default router;
