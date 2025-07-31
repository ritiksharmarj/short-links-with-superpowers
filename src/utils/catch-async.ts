import type { NextFunction, Request, Response } from "express";

export const catchAsync = <T>(
  func: (req: Request, res: Response, next: NextFunction) => Promise<T>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
};
