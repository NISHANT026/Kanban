import { Request, Response, NextFunction } from "express";
import type { MemberRole } from "@kanban/types";
import * as projectRepo from "../repositories/project.repository.js";

declare global {
  namespace Express {
    interface Request {
      projectRole?: MemberRole;
    }
  }
}

/**
 * Middleware that verifies the user is a member of the project
 * specified by :projectId param. Optionally requires a minimum role.
 */
export function requireProjectMember(minRole?: MemberRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.projectId as string;
    const userId = req.userId!;

    const member = await projectRepo.getMemberRole(projectId, userId);
    if (!member) {
      res.status(403).json({ error: "Not a member of this project" });
      return;
    }

    if (minRole === "ADMIN" && member.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    req.projectRole = member.role;
    next();
  };
}
