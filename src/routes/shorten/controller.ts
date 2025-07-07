import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";
import z from "zod";
import { db } from "@/db";
import { shorten } from "@/db/schema";
import AppError from "@/utils/app-error";
import { catchAsync } from "@/utils/catch-async";

const createShortenSchema = z.object({
  url: z.string().url("Invalid URL format"),
  shortCode: z.string().min(1).optional(),
});

export const createShortUrl = catchAsync(
  async (req: Request, res: Response) => {
    const validatedData = createShortenSchema.parse(req.body);
    const { url, shortCode } = validatedData;

    const updatedShortCode = shortCode ?? nanoid(10);

    const [result] = await db
      .insert(shorten)
      .values({
        url,
        shortCode: updatedShortCode,
      })
      .returning();

    res.status(201).json({
      status: "success",
      data: result,
    });
  },
);

const getOriginalUrlSchema = z.object({
  shortCode: z
    .string()
    .min(1, "Short code cannot be empty")
    .regex(/^[a-zA-Z0-9_-]+$/, "Short code contains invalid characters"),
});

export const getOriginalUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedParams = getOriginalUrlSchema.parse(req.params);
    const { shortCode } = validatedParams;

    const [result] = await db
      .select()
      .from(shorten)
      .where(eq(shorten.shortCode, shortCode));

    if (!result) {
      return next(new AppError("Short code not found", 404));
    }

    // Increment access count
    await db
      .update(shorten)
      .set({ accessCount: result.accessCount + 1 })
      .where(eq(shorten.shortCode, shortCode));

    res.status(200).json({
      status: "success",
      data: result,
    });
  },
);

const updateShortenSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

export const updateShortUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedParams = getOriginalUrlSchema.parse(req.params);
    const { shortCode } = validatedParams;

    const validatedData = updateShortenSchema.parse(req.body);
    const { url } = validatedData;

    // Check if short code exists
    const [existing] = await db
      .select()
      .from(shorten)
      .where(eq(shorten.shortCode, shortCode));

    if (!existing) {
      return next(new AppError("Short code not found", 404));
    }

    // Update the URL
    const [result] = await db
      .update(shorten)
      .set({ url })
      .where(eq(shorten.shortCode, shortCode))
      .returning();

    res.status(200).json({
      status: "success",
      data: result,
    });
  },
);

export const deleteShortUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedParams = getOriginalUrlSchema.parse(req.params);
    const { shortCode } = validatedParams;

    const [result] = await db
      .select()
      .from(shorten)
      .where(eq(shorten.shortCode, shortCode));

    if (!result) {
      return next(new AppError("Short code not found", 404));
    }

    await db.delete(shorten).where(eq(shorten.shortCode, shortCode));

    res.status(204).json({
      status: "success",
      message: "Short URL was successfully deleted.",
    });
  },
);

export const getShortUrlStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const validatedParams = getOriginalUrlSchema.parse(req.params);
    const { shortCode } = validatedParams;

    const [result] = await db
      .select()
      .from(shorten)
      .where(eq(shorten.shortCode, shortCode));

    if (!result) {
      return next(new AppError("Short code not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: result,
    });
  },
);
