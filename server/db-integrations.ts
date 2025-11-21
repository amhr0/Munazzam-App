import { eq, and, desc } from "drizzle-orm";
import { 
  integrations, 
  calendarEvents, 
  emails,
  type InsertIntegration,
  type InsertCalendarEvent,
  type InsertEmail
} from "../drizzle/schema";
import type { Integration, CalendarEvent, Email } from "../drizzle/schema";

export type { Integration, CalendarEvent, Email };
import { getDb } from "./db";

// ============= Integrations =============

export async function createIntegration(data: InsertIntegration): Promise<Integration> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(integrations).values(data);
  const insertedId = result[0].insertId;
  
  const inserted = await db.select().from(integrations).where(eq(integrations.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getIntegrationsByUserId(userId: number): Promise<Integration[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(integrations).where(eq(integrations.userId, userId));
}

export async function getIntegrationById(id: number): Promise<Integration | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(integrations).where(eq(integrations.id, id)).limit(1);
  return result[0];
}

export async function getIntegrationByUserAndProvider(
  userId: number, 
  provider: 'google' | 'microsoft'
): Promise<Integration | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(integrations)
    .where(and(
      eq(integrations.userId, userId),
      eq(integrations.provider, provider)
    ))
    .limit(1);
  
  return result[0];
}

export async function updateIntegration(
  id: number, 
  data: Partial<InsertIntegration>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(integrations).set(data).where(eq(integrations.id, id));
}

export async function deleteIntegration(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(integrations).where(eq(integrations.id, id));
}

// ============= Calendar Events =============

export async function createCalendarEvent(data: InsertCalendarEvent): Promise<CalendarEvent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(calendarEvents).values(data);
  const insertedId = result[0].insertId;
  
  const inserted = await db.select().from(calendarEvents).where(eq(calendarEvents.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getCalendarEventsByUserId(userId: number): Promise<CalendarEvent[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(calendarEvents)
    .where(eq(calendarEvents.userId, userId))
    .orderBy(desc(calendarEvents.startTime));
}

export async function getCalendarEventByExternalId(
  integrationId: number,
  externalId: string
): Promise<CalendarEvent | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(calendarEvents)
    .where(and(
      eq(calendarEvents.integrationId, integrationId),
      eq(calendarEvents.externalId, externalId)
    ))
    .limit(1);
  
  return result[0];
}

export async function updateCalendarEvent(
  id: number,
  data: Partial<InsertCalendarEvent>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id));
}

export async function deleteCalendarEventsByIntegrationId(integrationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(calendarEvents).where(eq(calendarEvents.integrationId, integrationId));
}

// ============= Emails =============

export async function createEmail(data: InsertEmail): Promise<Email> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emails).values(data);
  const insertedId = result[0].insertId;
  
  const inserted = await db.select().from(emails).where(eq(emails.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getEmailsByUserId(userId: number, limit: number = 50): Promise<Email[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(emails)
    .where(eq(emails.userId, userId))
    .orderBy(desc(emails.receivedAt))
    .limit(limit);
}

export async function getUnanalyzedEmails(userId: number): Promise<Email[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(emails)
    .where(and(
      eq(emails.userId, userId),
      eq(emails.analyzed, 0)
    ))
    .orderBy(desc(emails.receivedAt));
}

export async function getEmailByExternalId(
  integrationId: number,
  externalId: string
): Promise<Email | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(emails)
    .where(and(
      eq(emails.integrationId, integrationId),
      eq(emails.externalId, externalId)
    ))
    .limit(1);
  
  return result[0];
}

export async function updateEmail(
  id: number,
  data: Partial<InsertEmail>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(emails).set(data).where(eq(emails.id, id));
}

export async function deleteEmailsByIntegrationId(integrationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(emails).where(eq(emails.integrationId, integrationId));
}
