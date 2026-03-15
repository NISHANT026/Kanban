import { Router } from "express";
import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { AppError } from "../services/auth.service.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { signupSchema, loginSchema } from "../validation/auth.js";

const router = Router();

router.post("/signup", validate(signupSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.signup(name, email, password);
    res.status(201).json({ data: result });
  } catch (e) {
    if (e instanceof AppError) {
      res.status(e.statusCode).json({ error: e.message });
      return;
    }
    throw e;
  }
});

router.post("/login", validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ data: result });
  } catch (e) {
    if (e instanceof AppError) {
      res.status(e.statusCode).json({ error: e.message });
      return;
    }
    throw e;
  }
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await authService.getMe(req.userId!);
    res.json({ data: user });
  } catch (e) {
    if (e instanceof AppError) {
      res.status(e.statusCode).json({ error: e.message });
      return;
    }
    throw e;
  }
});

export default router;
