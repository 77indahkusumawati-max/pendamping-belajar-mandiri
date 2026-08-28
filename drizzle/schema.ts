import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/mysql-core";

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
  activityDates: text("activityDates"),
  dailyTargetMinutes: int("dailyTargetMinutes").default(30).notNull(),
  reminderEnabled: int("reminderEnabled").default(0).notNull(),
  reminderTime: varchar("reminderTime", { length: 5 }).default("19:00").notNull(),
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

export const materialBookmarks = mysqlTable("materialBookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ userSubjectUnique: uniqueIndex("materialBookmarks_user_subject").on(table.userId, table.subject) }));

export const aiConversations = mysqlTable("aiConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 120 }).notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const materialComments = mysqlTable("materialComments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 120 }).notNull(),
  body: text("body").notNull(),
  status: varchar("status", { length: 16 }).default("visible").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const managedMaterials = mysqlTable("managedMaterials", {
  id: int("id").autoincrement().primaryKey(),
  subject: varchar("subject", { length: 120 }).notNull().unique(),
  title: varchar("title", { length: 180 }).notNull(),
  summary: text("summary").notNull(),
  steps: text("steps").notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  level: varchar("level", { length: 32 }).notNull(),
  difficulty: varchar("difficulty", { length: 32 }).notNull(),
  track: varchar("track", { length: 80 }).notNull(),
  createdBy: int("createdBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const studyPreferences = mysqlTable("studyPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  interests: text("interests").notNull(),
  preferredTrack: varchar("preferredTrack", { length: 80 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const uploadedMaterials = mysqlTable("uploadedMaterials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1024 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  aiSummary: text("aiSummary"),
  aiQuiz: text("aiQuiz"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});