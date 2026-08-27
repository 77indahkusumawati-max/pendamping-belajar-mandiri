import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { addQuizAttempt, getRecentQuizAttempts, getStudyProgress, upsertStudyProgress } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  progress: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const saved = await getStudyProgress(ctx.user.id);
      const attempts = await getRecentQuizAttempts(ctx.user.id);
      return {
        tasks: saved ? JSON.parse(saved.taskState) : null,
        completedMaterials: saved ? JSON.parse(saved.completedMaterials) : [],
        weeklyActivity: saved ? JSON.parse(saved.weeklyActivity) : {},
        dailyTargetMinutes: saved?.dailyTargetMinutes ?? 30,
        attempts,
      };
    }),
    save: protectedProcedure.input(z.object({
      tasks: z.array(z.object({ id: z.number(), title: z.string(), meta: z.string(), done: z.boolean() })),
      completedMaterials: z.array(z.string()),
      weeklyActivity: z.record(z.string(), z.number().int().min(0)).default({}),
      dailyTargetMinutes: z.number().int().min(10).max(240),
    })).mutation(async ({ ctx, input }) => {
      return upsertStudyProgress({
        userId: ctx.user.id,
        taskState: JSON.stringify(input.tasks),
        completedMaterials: JSON.stringify(input.completedMaterials),
        weeklyActivity: JSON.stringify(input.weeklyActivity),
        dailyTargetMinutes: input.dailyTargetMinutes,
      });
    }),
  }),
  quiz: router({
    submit: protectedProcedure.input(z.object({ quizKey: z.string().max(64), score: z.number().int().min(0), total: z.number().int().positive() })).mutation(({ ctx, input }) => addQuizAttempt({ userId: ctx.user.id, ...input })),
    recent: protectedProcedure.query(({ ctx }) => getRecentQuizAttempts(ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
