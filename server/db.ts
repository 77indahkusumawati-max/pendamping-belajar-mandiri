import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, quizAttempts, studyProgress, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStudyProgress(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(studyProgress).where(eq(studyProgress.userId, userId)).limit(1);
  return rows[0];
}

export async function upsertStudyProgress(input: {
  userId: number;
  taskState: string;
  completedMaterials: string;
  weeklyActivity: string;
  activityDates: string | null;
  dailyTargetMinutes: number;
  reminderEnabled: number;
  reminderTime: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(studyProgress).values(input).onDuplicateKeyUpdate({
    set: {
      taskState: input.taskState,
      completedMaterials: input.completedMaterials,
      weeklyActivity: input.weeklyActivity,
      activityDates: input.activityDates,
      dailyTargetMinutes: input.dailyTargetMinutes,
      reminderEnabled: input.reminderEnabled,
      reminderTime: input.reminderTime,
      updatedAt: new Date(),
    },
  });
  return getStudyProgress(input.userId);
}

export async function addQuizAttempt(input: { userId: number; quizKey: string; score: number; total: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(quizAttempts).values(input);
  return getRecentQuizAttempts(input.userId);
}

export async function getRecentQuizAttempts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.completedAt)).limit(10);
}

export async function getLeaderboard(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const people = await db.select({ id: users.id, name: users.name }).from(users).limit(100);
  const rows = await Promise.all(people.map(async (person) => {
    const progress = await getStudyProgress(person.id);
    const attempts = await db.select().from(quizAttempts).where(eq(quizAttempts.userId, person.id));
    const completedMaterials = progress ? JSON.parse(progress.completedMaterials) as string[] : [];
    const quizPoints = attempts.reduce((sum, attempt) => sum + (attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0), 0);
    return { userId: person.id, name: person.name || "Teman belajar", points: completedMaterials.length * 10 + quizPoints, materialsCompleted: completedMaterials.length, quizzesCompleted: attempts.length, isCurrentUser: person.id === userId };
  }));
  return rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name)).map((row, index) => ({ ...row, rank: index + 1 }));
}
