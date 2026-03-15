import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

/** Extends Express Request with the authenticated user's ID */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/** Rejects requests without a valid JWT Bearer token */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as {
      userId: string;
    };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
