import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const shorten = pgTable("shorten", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

// "id": "1",
// "url": "https://www.example.com/some/long/url",
// "shortCode": "abc123",
// "createdAt": "2021-09-01T12:00:00Z",
// "updatedAt": "2021-09-01T12:00:00Z"
