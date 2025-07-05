import type { NextFunction, Request, Response } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const catchAsync = (func: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
};
