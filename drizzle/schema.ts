import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Meetings table - stores meeting recordings and analysis
 */
export const meetings = mysqlTable("meetings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  fileType: varchar("fileType", { length: 50 }),
  transcription: text("transcription"),
  analysis: text("analysis"), // JSON string
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Interviews table - stores interview recordings and talent analysis
 */
export const interviews = mysqlTable("interviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  candidateName: varchar("candidateName", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  fileType: varchar("fileType", { length: 50 }),
  transcription: text("transcription"),
  analysis: text("analysis"), // JSON string with behavioral signals
  recommendation: mysqlEnum("recommendation", ["hire", "no_hire", "pending"]).default("pending"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tasks table - stores extracted tasks from meetings and emails
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: varchar("assignedTo", { length: 255 }),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "completed", "cancelled"]).default("todo").notNull(),
  sourceType: mysqlEnum("sourceType", ["meeting", "email", "manual"]),
  sourceId: int("sourceId"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Processing jobs table - tracks background processing tasks
 */
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["transcription", "meeting_analysis", "interview_analysis", "email_analysis"]).notNull(),
  entityType: mysqlEnum("entityType", ["meeting", "interview", "email"]).notNull(),
  entityId: int("entityId").notNull(),
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued").notNull(),
  progress: int("progress").default(0).notNull(),
  error: text("error"),
  result: text("result"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

/**
 * Daily briefings table - stores generated daily briefings
 */
export const briefings = mysqlTable("briefings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  content: text("content").notNull(), // JSON string with briefing data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = typeof meetings.$inferInsert;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = typeof interviews.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
export type Briefing = typeof briefings.$inferSelect;
export type InsertBriefing = typeof briefings.$inferInsert;

/**
 * External integrations (Google, Microsoft)
 */
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["google", "microsoft"]).notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  scope: text("scope"),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * Calendar events synced from external calendars
 */
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  integrationId: int("integrationId").notNull(),
  externalId: varchar("externalId", { length: 255 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  location: text("location"),
  attendees: text("attendees"),
  status: mysqlEnum("status", ["confirmed", "tentative", "cancelled"]).default("confirmed").notNull(),
  meetingUrl: text("meetingUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

/**
 * Emails analyzed for tasks and insights
 */
export const emails = mysqlTable("emails", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  integrationId: int("integrationId").notNull(),
  externalId: varchar("externalId", { length: 255 }).notNull(),
  subject: text("subject").notNull(),
  from: varchar("from", { length: 320 }).notNull(),
  to: text("to"),
  body: text("body"),
  receivedAt: timestamp("receivedAt").notNull(),
  analyzed: int("analyzed").default(0).notNull(),
  extractedTasks: text("extractedTasks"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;
