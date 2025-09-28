import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const editSessions = pgTable("edit_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  batchId: varchar("batch_id"), // For grouping multiple images processed together
  originalImageUrl: text("original_image_url").notNull(),
  currentImageUrl: text("current_image_url"),
  prompt: text("prompt"),
  status: text("status").notNull().default('idle'), // 'idle', 'processing', 'completed', 'error'
  settings: jsonb("settings").default({}),
  processingStartedAt: timestamp("processing_started_at"),
  processingCompletedAt: timestamp("processing_completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const editHistory = pgTable("edit_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => editSessions.id).notNull(),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt").notNull(),
  processingTime: integer("processing_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  prompt: text("prompt").notNull(),
  settings: jsonb("settings").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEditSessionSchema = createInsertSchema(editSessions).pick({
  userId: true,
  batchId: true,
  originalImageUrl: true,
  prompt: true,
  settings: true,
});

export const insertEditHistorySchema = createInsertSchema(editHistory).pick({
  sessionId: true,
  imageUrl: true,
  prompt: true,
  processingTime: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  description: true,
  category: true,
  thumbnailUrl: true,
  prompt: true,
  settings: true,
});

export type InsertEditSession = z.infer<typeof insertEditSessionSchema>;
export type EditSession = typeof editSessions.$inferSelect;

export type InsertEditHistory = z.infer<typeof insertEditHistorySchema>;
export type EditHistory = typeof editHistory.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
