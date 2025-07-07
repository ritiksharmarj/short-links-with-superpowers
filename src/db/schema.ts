import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const shorten = pgTable("shorten", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  accessCount: integer("access_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// "id": "1",
// "url": "https://www.example.com/some/long/url",
// "shortCode": "abc123",
// "createdAt": "2021-09-01T12:00:00Z",
// "updatedAt": "2021-09-01T12:00:00Z",
// "accessCount": 10
