import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";
import { 
  createMeeting, 
  getMeetingsByUserId, 
  getMeetingById,
  createInterview,
  getInterviewsByUserId,
  getInterviewById,
  getTasksByUserId,
  updateTask,
  createJob,
  getDb
} from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ragService } from "./services/rag";
import { generateDailyBriefing } from "./services/dailyBriefing";
import { createBriefing, getBriefingByUserAndDate } from "./db";
import { getEmotionAnalysis, getEmotionSummary } from "./db-emotions";
import { 
  createPasswordResetToken, 
  getPasswordResetToken, 
  markTokenAsUsed, 
  getUserByEmail,
  updateUserPassword 
} from "./db";
import { sendPasswordResetEmail } from "./services/emailService";

// Initialize RAG service on startup
ragService.initialize().catch(console.error);

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    // Register new user
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password, name } = input;
        
        // Check if user exists
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existing.length > 0) {
          throw new Error("Email already registered");
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const openId = `local_${Date.now()}_${Math.random().toString(36)}`;
        await db.insert(users).values({
          openId,
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          loginMethod: 'local',
          role: 'user',
        });
        
        // Get created user
        const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
        
        // Create JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          ENV.jwtSecret,
          { expiresIn: '7d' }
        );
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      }),
    
    // Login
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Find user
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }
        
        // Verify password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error("Invalid email or password");
        }
        
        // Update last signed in
        await db.update(users)
          .set({ lastSignedIn: new Date() })
          .where(eq(users.id, user.id));
        
        // Create JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          ENV.jwtSecret,
          { expiresIn: '7d' }
        );
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      }),
    
    // Request password reset
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const { email } = input;
        
        // Find user by email
        const user = await getUserByEmail(email);
        if (!user) {
          // لا نكشف إذا كان البريد موجود أم لا (أمان)
          return { success: true };
        }
        
        // Create reset token
        const token = await createPasswordResetToken(user.id);
        
        // Send email
        const emailSent = await sendPasswordResetEmail(email, token, user.name || undefined);
        
        if (!emailSent) {
          throw new Error("فشل إرسال البريد الإلكتروني");
        }
        
        return { success: true };
      }),
    
    // Reset password with token
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const { token, newPassword } = input;
        
        // Get token from database
        const resetToken = await getPasswordResetToken(token);
        
        if (!resetToken) {
          throw new Error("رمز غير صالح");
        }
        
        // Check if token is used
        if (resetToken.used) {
          throw new Error("تم استخدام هذا الرمز مسبقاً");
        }
        
        // Check if token is expired
        if (new Date() > resetToken.expiresAt) {
          throw new Error("انتهت صلاحية الرمز");
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user password
        await updateUserPassword(resetToken.userId, hashedPassword);
        
        // Mark token as used
        await markTokenAsUsed(token);
        
        return { success: true };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  meetings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getMeetingsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const meeting = await getMeetingById(input.id);
        if (!meeting || meeting.userId !== ctx.user.id) {
          throw new Error("Meeting not found");
        }
        return meeting;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        fileData: z.string().optional(), // base64
        fileName: z.string().optional(),
        fileType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        let fileUrl: string | undefined;
        let fileKey: string | undefined;

        // Upload file if provided
        if (input.fileData && input.fileName) {
          const buffer = Buffer.from(input.fileData, 'base64');
          const randomSuffix = Math.random().toString(36).substring(7);
          const key = `${ctx.user.id}/meetings/${input.fileName}-${randomSuffix}`;
          
          const result = await storagePut(
            key,
            buffer,
            input.fileType || 'application/octet-stream'
          );
          
          fileUrl = result.url;
          fileKey = result.key;
        }

        // Create meeting
        const meeting = await createMeeting({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          fileUrl,
          fileKey,
          fileType: input.fileType,
          status: 'pending'
        });

        // Create transcription job if file exists
        if (fileUrl) {
          await createJob({
            userId: ctx.user.id,
            type: 'transcription',
            entityType: 'meeting',
            entityId: meeting.id,
            status: 'queued'
          });
        }

        return meeting;
      }),
  }),

  interviews: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getInterviewsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const interview = await getInterviewById(input.id);
        if (!interview || interview.userId !== ctx.user.id) {
          throw new Error("Interview not found");
        }
        return interview;
      }),

    create: protectedProcedure
      .input(z.object({
        candidateName: z.string(),
        position: z.string().optional(),
        fileData: z.string().optional(), // base64
        fileName: z.string().optional(),
        fileType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        let fileUrl: string | undefined;
        let fileKey: string | undefined;

        // Upload file if provided
        if (input.fileData && input.fileName) {
          const buffer = Buffer.from(input.fileData, 'base64');
          const randomSuffix = Math.random().toString(36).substring(7);
          const key = `${ctx.user.id}/interviews/${input.fileName}-${randomSuffix}`;
          
          const result = await storagePut(
            key,
            buffer,
            input.fileType || 'application/octet-stream'
          );
          
          fileUrl = result.url;
          fileKey = result.key;
        }

        // Create interview
        const interview = await createInterview({
          userId: ctx.user.id,
          candidateName: input.candidateName,
          position: input.position,
          fileUrl,
          fileKey,
          fileType: input.fileType,
          status: 'pending'
        });

        // Create transcription job if file exists
        if (fileUrl) {
          await createJob({
            userId: ctx.user.id,
            type: 'transcription',
            entityType: 'interview',
            entityId: interview.id,
            status: 'queued'
          });
        }

        return interview;
      }),
  }),

  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getTasksByUserId(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.status) updateData.status = input.status;
        if (input.priority) updateData.priority = input.priority;
        if (input.status === 'completed') {
          updateData.completedAt = new Date();
        }
        
        await updateTask(input.id, updateData);
        return { success: true };
      }),
  }),

  knowledge: router({
    list: protectedProcedure.query(() => {
      return ragService.getKnowledgeBase();
    }),
  }),

  briefing: router({
    today: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date();
      
      // Check if briefing already exists for today
      const existing = await getBriefingByUserAndDate(ctx.user.id, today);
      if (existing) {
        return JSON.parse(existing.content);
      }

      // Generate new briefing
      const briefingData = await generateDailyBriefing(ctx.user.id);
      
      // Save to database
      await createBriefing({
        userId: ctx.user.id,
        date: today,
        content: JSON.stringify(briefingData)
      });

      return briefingData;
    }),

    refresh: protectedProcedure.mutation(async ({ ctx }) => {
      // Generate fresh briefing
      const briefingData = await generateDailyBriefing(ctx.user.id);
      
      // Save to database
      const today = new Date();
      await createBriefing({
        userId: ctx.user.id,
        date: today,
        content: JSON.stringify(briefingData)
      });

      return briefingData;
    }),
  }),

  integrations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getIntegrationsByUserId } = await import("./db-integrations");
      return getIntegrationsByUserId(ctx.user.id);
    }),
    
    getAuthUrl: protectedProcedure
      .input(z.object({ provider: z.enum(["google", "microsoft"]) }))
      .query(async ({ input, ctx }) => {
        const { getGoogleAuthUrl, getMicrosoftAuthUrl } = await import("./services/oauth");
        const state = `${ctx.user.id}:${Date.now()}`;
        
        if (input.provider === "google") {
          return { url: getGoogleAuthUrl(state) };
        } else {
          return { url: getMicrosoftAuthUrl(state) };
        }
      }),
    
    disconnect: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteIntegration, deleteCalendarEventsByIntegrationId, deleteEmailsByIntegrationId } = await import("./db-integrations");
        
        await deleteCalendarEventsByIntegrationId(input.id);
        await deleteEmailsByIntegrationId(input.id);
        await deleteIntegration(input.id);
        
        return { success: true };
      }),
    
    syncCalendar: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { syncCalendar } = await import("./services/calendarSync");
        const count = await syncCalendar(input.integrationId, ctx.user.id);
        return { success: true, syncedCount: count };
      }),
    
    syncEmail: protectedProcedure
      .input(z.object({ integrationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { getIntegrationById } = await import("./db-integrations");
        const integration = await getIntegrationById(input.integrationId);
        
        if (!integration) {
          throw new Error("Integration not found");
        }
        
        let count = 0;
        if (integration.provider === "google") {
          const { syncGmail } = await import("./services/emailAnalysis");
          count = await syncGmail(input.integrationId, ctx.user.id);
        } else {
          const { syncOutlookEmail } = await import("./services/emailAnalysis");
          count = await syncOutlookEmail(input.integrationId, ctx.user.id);
        }
        
        return { success: true, syncedCount: count };
      }),
    
    analyzeEmails: protectedProcedure.mutation(async ({ ctx }) => {
      const { analyzeAllUnanalyzedEmails } = await import("./services/emailAnalysis");
      const count = await analyzeAllUnanalyzedEmails(ctx.user.id);
      return { success: true, analyzedCount: count };
    }),
  }),

  calendar: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getCalendarEventsByUserId } = await import("./db-integrations");
      return getCalendarEventsByUserId(ctx.user.id);
    }),
  }),

  emails: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const { getEmailsByUserId } = await import("./db-integrations");
        return getEmailsByUserId(ctx.user.id, input?.limit);
      }),
  }),

  emotions: router({
    getAnalysis: protectedProcedure
      .input(z.object({
        entityType: z.enum(["meeting", "interview"]),
        entityId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getEmotionAnalysis(input.entityType, input.entityId);
      }),
    
    getSummary: protectedProcedure
      .input(z.object({
        entityType: z.enum(["meeting", "interview"]),
        entityId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getEmotionSummary(input.entityType, input.entityId);
      }),
    
    startAnalysis: protectedProcedure
      .input(z.object({
        entityType: z.enum(["meeting", "interview"]),
        entityId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Create emotion analysis job
        const jobId = await createJob({
          userId: ctx.user.id,
          type: "emotion_analysis",
          entityType: input.entityType,
          entityId: input.entityId,
        });
        
        return { success: true, jobId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
