import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
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
  createJob
} from "./db";
import { ragService } from "./services/rag";

// Initialize RAG service on startup
ragService.initialize().catch(console.error);

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
});

export type AppRouter = typeof appRouter;
