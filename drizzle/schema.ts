import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const studyProgress = mysqlTable("studyProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  taskState: text("taskState").notNull(),
  completedMaterials: text("completedMaterials").notNull(),
  weeklyActivity: text("weeklyActivity").notNull(),
  dailyTargetMinutes: int("dailyTargetMinutes").default(30).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const quizAttempts = mysqlTable("quizAttempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quizKey: varchar("quizKey", { length: 64 }).notNull(),
  score: int("score").notNull(),
  total: int("total").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type StudyProgress = typeof studyProgress.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;