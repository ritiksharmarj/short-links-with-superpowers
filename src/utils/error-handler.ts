import type { NextFunction, Request, Response } from "express";
import type AppError from "./app-error";

function sendErrorDev(err: AppError, _req: Request, res: Response) {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function sendErrorProd(err: AppError, _req: Request, res: Response) {
  // Only send operational errors to client in production
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Don't leak error details in production for non-operational errors
  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
}

export function globalErrorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  }

  if (process.env.NODE_ENV === "production") {
    sendErrorProd(err, req, res);
  }
}
