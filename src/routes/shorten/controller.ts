import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";
import z from "zod";
import { db } from "@/db";
import { type Shorten, shorten } from "@/db/schema";
import AppError from "@/utils/app-error";
import { catchAsync } from "@/utils/catch-async";
import { redis } from "@/utils/redis";

const createShortenSchema = z.object({
  url: z.string().url("Invalid URL format"),
  shortCode: z.string().min(1).optional(),
});

export const createShortUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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

    if (!result) {
      return next(new AppError("Failed to create short URL", 400));
    }

    res.status(201).json({
      status: "success",
      data: {
        id: result.id,
        url: result.url,
        shortCode: result.shortCode,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
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

    const cacheKey = `shorturl:${shortCode}`;
    const cacheData = await redis.get(cacheKey);

    if (cacheData) {
      const result = JSON.parse(cacheData) as Shorten;
      const updatedAccessCount = result.accessCount + 1;

      await db
        .update(shorten)
        .set({ accessCount: updatedAccessCount })
        .where(eq(shorten.shortCode, shortCode));

      const updatedCacheData = {
        ...result,
        accessCount: updatedAccessCount,
      };

      await redis.setEx(cacheKey, 3600, JSON.stringify(updatedCacheData));

      return res.status(200).json({
        status: "success",
        data: {
          id: result.id,
          url: result.url,
          shortCode: result.shortCode,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
      });
    }

    // delay
    await new Promise((res) => setTimeout(res, 1000));

    const [result] = await db
      .select()
      .from(shorten)
      .where(eq(shorten.shortCode, shortCode));

    if (!result) {
      return next(new AppError("Short code not found", 404));
    }

    const updatedAccessCount = result.accessCount + 1;

    // Increment access count
    await db
      .update(shorten)
      .set({ accessCount: updatedAccessCount })
      .where(eq(shorten.shortCode, shortCode));

    const updatedCacheData = {
      ...result,
      accessCount: updatedAccessCount,
    };

    // Cache the result
    await redis.setEx(cacheKey, 3600, JSON.stringify(updatedCacheData));

    res.status(200).json({
      status: "success",
      data: {
        id: result.id,
        url: result.url,
        shortCode: result.shortCode,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
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

    if (!result) {
      return next(new AppError("Failed to update short URL", 400));
    }

    // Invalidate cache after update
    await redis.del(`shorturl:${shortCode}`);

    res.status(200).json({
      status: "success",
      data: {
        id: result.id,
        url: result.url,
        shortCode: result.shortCode,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
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

    // Invalidate cache after deletion
    await redis.del(`shorturl:${shortCode}`);

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
