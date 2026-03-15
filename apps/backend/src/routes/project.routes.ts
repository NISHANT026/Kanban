import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireProjectMember } from "../middleware/projectAuth.js";
import { validate } from "../middleware/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "../validation/project.js";
import * as projectRepo from "../repositories/project.repository.js";
import * as userRepo from "../repositories/user.repository.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const projects = await projectRepo.findByUserId(req.userId!);
  res.json({ data: projects });
});

router.post("/", validate(createProjectSchema), async (req: Request, res: Response) => {
  const existing = await projectRepo.findByKey(req.body.key);
  if (existing) {
    res.status(409).json({ error: "Project key already exists" });
    return;
  }
  const project = await projectRepo.create({
    ...req.body,
    createdById: req.userId!,
  });
  res.status(201).json({ data: project });
});

router.get("/:projectId", requireProjectMember(), async (req: Request, res: Response) => {
  const project = await projectRepo.findById(req.params.projectId as string);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ data: project });
});

router.patch(
  "/:projectId",
  requireProjectMember("ADMIN"),
  validate(updateProjectSchema),
  async (req: Request, res: Response) => {
    const project = await projectRepo.update(req.params.projectId as string, req.body);
    res.json({ data: project });
  },
);

router.delete(
  "/:projectId",
  requireProjectMember("ADMIN"),
  async (req: Request, res: Response) => {
    await projectRepo.remove(req.params.projectId as string);
    res.json({ message: "Project deleted" });
  },
);

// ─── Members ─────────────────────────────────────────────────────────

router.post(
  "/:projectId/members",
  requireProjectMember("ADMIN"),
  validate(addMemberSchema),
  async (req: Request, res: Response) => {
    const user = await userRepo.findByEmail(req.body.email);
    if (!user) {
      res.status(404).json({ error: "User not found with that email" });
      return;
    }
    const existing = await projectRepo.getMemberRole(
      req.params.projectId as string,
      user.id,
    );
    if (existing) {
      res.status(409).json({ error: "User is already a member" });
      return;
    }
    const member = await projectRepo.addMember(
      req.params.projectId as string,
      user.id,
      req.body.role,
    );
    res.status(201).json({ data: member });
  },
);

router.delete(
  "/:projectId/members/:userId",
  requireProjectMember("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      await projectRepo.removeMember(
        req.params.projectId as string,
        req.params.userId as string,
      );
      res.json({ message: "Member removed" });
    } catch {
      res.status(404).json({ error: "Member not found" });
    }
  },
);

export default router;
