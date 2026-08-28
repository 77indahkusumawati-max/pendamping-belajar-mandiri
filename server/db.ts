import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, aiConversations, materialBookmarks, materialComments, managedMaterials, quizAttempts, studyPreferences, studyProgress, uploadedMaterials, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { and, or } from "drizzle-orm";

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


export async function getBookmarkedSubjects(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(materialBookmarks).where(eq(materialBookmarks.userId, userId));
}

export async function toggleMaterialBookmark(userId: number, subject: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select().from(materialBookmarks).where(and(eq(materialBookmarks.userId, userId), eq(materialBookmarks.subject, subject))).limit(1);
  if (existing.length) {
    await db.delete(materialBookmarks).where(eq(materialBookmarks.id, existing[0].id));
    return { bookmarked: false };
  }
  await db.insert(materialBookmarks).values({ userId, subject });
  return { bookmarked: true };
}

export async function getHiddenMaterialComments() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select({ id: materialComments.id, subject: materialComments.subject, body: materialComments.body, status: materialComments.status, createdAt: materialComments.createdAt, updatedAt: materialComments.updatedAt, userId: materialComments.userId, userName: users.name }).from(materialComments).leftJoin(users, eq(materialComments.userId, users.id)).where(eq(materialComments.status, "hidden")).orderBy(desc(materialComments.updatedAt));
}

export async function getMaterialComments(subject: string, viewerId?: number, isAdmin = false) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const visibility = isAdmin || viewerId === undefined ? eq(materialComments.subject, subject) : and(eq(materialComments.subject, subject), or(eq(materialComments.status, "visible"), eq(materialComments.userId, viewerId)));
  return db.select({ id: materialComments.id, subject: materialComments.subject, body: materialComments.body, status: materialComments.status, createdAt: materialComments.createdAt, userId: materialComments.userId, userName: users.name }).from(materialComments).leftJoin(users, eq(materialComments.userId, users.id)).where(visibility).orderBy(desc(materialComments.createdAt));
}

export async function updateMaterialComment(id: number, userId: number, body: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select().from(materialComments).where(and(eq(materialComments.id, id), eq(materialComments.userId, userId))).limit(1);
  if (!existing.length) throw new Error("Komentar tidak ditemukan atau bukan milikmu");
  await db.update(materialComments).set({ body }).where(eq(materialComments.id, id));
  return getMaterialComments(existing[0].subject, userId);
}

export async function deleteMaterialComment(id: number, userId: number, isAdmin = false) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select().from(materialComments).where(eq(materialComments.id, id)).limit(1);
  if (!existing.length || (!isAdmin && existing[0].userId !== userId)) throw new Error("Komentar tidak dapat dihapus");
  await db.delete(materialComments).where(eq(materialComments.id, id));
  return { success: true };
}

export async function moderateMaterialComment(id: number, status: "visible" | "hidden") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(materialComments).set({ status }).where(eq(materialComments.id, id));
  return { success: true };
}

export async function addMaterialComment(input: { userId: number; subject: string; body: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(materialComments).values(input);
  return getMaterialComments(input.subject, input.userId);
}


export async function getAIConversation(userId: number, subject: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(aiConversations).where(and(eq(aiConversations.userId, userId), eq(aiConversations.subject, subject))).orderBy(aiConversations.createdAt);
}

export async function saveAIConversation(userId: number, subject: string, entries: Array<{ role: "user" | "assistant"; message: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (entries.length) await db.insert(aiConversations).values(entries.map((entry) => ({ userId, subject, role: entry.role, message: entry.message })));
  return getAIConversation(userId, subject);
}

export async function getManagedMaterials() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(managedMaterials).orderBy(desc(managedMaterials.updatedAt));
}

export async function upsertManagedMaterial(input: { id?: number; subject: string; title: string; summary: string; steps: string; source: string; level: string; difficulty: string; track: string; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (input.id) {
    await db.update(managedMaterials).set({ subject: input.subject, title: input.title, summary: input.summary, steps: input.steps, source: input.source, level: input.level, difficulty: input.difficulty, track: input.track, updatedAt: new Date() }).where(eq(managedMaterials.id, input.id));
  } else {
    await db.insert(managedMaterials).values(input);
  }
  return getManagedMaterials();
}

export async function deleteManagedMaterial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(managedMaterials).where(eq(managedMaterials.id, id));
  return { success: true };
}

export async function getStudyPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const rows = await db.select().from(studyPreferences).where(eq(studyPreferences.userId, userId)).limit(1);
  return rows[0] ?? { interests: "[]", preferredTrack: "Semua jalur" };
}

export async function upsertStudyPreferences(input: { userId: number; interests: string; preferredTrack: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(studyPreferences).values(input).onDuplicateKeyUpdate({ set: { interests: input.interests, preferredTrack: input.preferredTrack, updatedAt: new Date() } });
  return getStudyPreferences(input.userId);
}

export async function getUploadedMaterials(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(uploadedMaterials).where(eq(uploadedMaterials.userId, userId)).orderBy(desc(uploadedMaterials.createdAt));
}

export async function saveUploadedMaterial(input: { userId: number; title: string; fileName: string; fileKey: string; fileUrl: string; mimeType: string; sizeBytes: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(uploadedMaterials).values(input);
  return getUploadedMaterials(input.userId);
}
