import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  meetings, InsertMeeting, Meeting,
  interviews, InsertInterview, Interview,
  tasks, InsertTask, Task,
  jobs, InsertJob, Job,
  briefings, InsertBriefing, Briefing
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// Meetings
export async function createMeeting(meeting: InsertMeeting): Promise<Meeting> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(meetings).values(meeting);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(meetings).where(eq(meetings.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getMeetingsByUserId(userId: number): Promise<Meeting[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(meetings).where(eq(meetings.userId, userId)).orderBy(desc(meetings.createdAt));
}

export async function getMeetingById(id: number): Promise<Meeting | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
  return result[0];
}

export async function updateMeeting(id: number, data: Partial<Meeting>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(meetings).set(data).where(eq(meetings.id, id));
}

// Interviews
export async function createInterview(interview: InsertInterview): Promise<Interview> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(interviews).values(interview);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(interviews).where(eq(interviews.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getInterviewsByUserId(userId: number): Promise<Interview[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(interviews).where(eq(interviews.userId, userId)).orderBy(desc(interviews.createdAt));
}

export async function getInterviewById(id: number): Promise<Interview | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(interviews).where(eq(interviews.id, id)).limit(1);
  return result[0];
}

export async function updateInterview(id: number, data: Partial<Interview>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(interviews).set(data).where(eq(interviews.id, id));
}

// Tasks
export async function createTask(task: InsertTask): Promise<Task> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tasks).values(task);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(tasks).where(eq(tasks.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getTasksByUserId(userId: number): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
}

export async function updateTask(id: number, data: Partial<Task>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tasks).set(data).where(eq(tasks.id, id));
}

// Jobs
export async function createJob(job: InsertJob): Promise<Job> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(jobs).values(job);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(jobs).where(eq(jobs.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getJobById(id: number): Promise<Job | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result[0];
}

export async function updateJob(id: number, data: Partial<Job>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(jobs).set(data).where(eq(jobs.id, id));
}

export async function getQueuedJobs(): Promise<Job[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(jobs).where(eq(jobs.status, "queued")).orderBy(jobs.createdAt);
}

// Briefings
export async function createBriefing(briefing: InsertBriefing): Promise<Briefing> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(briefings).values(briefing);
  const insertedId = Number(result[0].insertId);
  const inserted = await db.select().from(briefings).where(eq(briefings.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getBriefingByUserAndDate(userId: number, date: Date): Promise<Briefing | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const result = await db.select().from(briefings)
    .where(
      and(
        eq(briefings.userId, userId),
        // Note: This is a simplified check, might need adjustment based on your needs
      )
    )
    .orderBy(desc(briefings.createdAt))
    .limit(1);
  
  return result[0];
}

// Password Reset Tokens
import { passwordResetTokens, InsertPasswordResetToken, PasswordResetToken } from "../drizzle/schema";
import crypto from 'crypto';

export async function createPasswordResetToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // توليد رمز عشوائي آمن
  const token = crypto.randomBytes(32).toString('hex');
  
  // صلاحية الرمز: ساعة واحدة
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  
  const resetToken: InsertPasswordResetToken = {
    userId,
    token,
    expiresAt,
    used: false,
  };
  
  await db.insert(passwordResetTokens).values(resetToken);
  return token;
}

export async function getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);
  
  return result[0];
}

export async function markTokenAsUsed(token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.token, token));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return result[0];
}

export async function updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));
}
