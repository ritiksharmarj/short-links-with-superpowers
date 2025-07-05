import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { nanoid } from "nanoid";
import z from "zod";
import { db } from "@/db";
import { shorten } from "@/db/schema";

const createShortenSchema = z.object({
  url: z.string().url("Invalid URL format"),
  shortCode: z.string().min(1).optional(),
});

export async function createShorten(req: Request, res: Response) {
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
}

const getOriginalUrlSchema = z.object({
  shortCode: z
    .string()
    .min(1, "Short code cannot be empty")
    .regex(/^[a-zA-Z0-9_-]+$/, "Short code contains invalid characters"),
});

export async function getOriginalUrl(req: Request, res: Response) {
  const validatedParams = getOriginalUrlSchema.parse(req.params);
  const { shortCode } = validatedParams;

  const [result] = await db
    .select()
    .from(shorten)
    .where(eq(shorten.shortCode, shortCode));

  res.status(200).json({
    status: "success",
    data: result,
  });
}
