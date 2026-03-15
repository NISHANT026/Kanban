import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express handler to catch rejected promises and forward
 * them to the error handler. Required because Express 4 doesn't do this.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
