import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { addMaterialComment, addQuizAttempt, deleteMaterialComment, getAIConversation, getBookmarkedSubjects, getHiddenMaterialComments, getLeaderboard, getMaterialComments, getRecentQuizAttempts, getStudyProgress, moderateMaterialComment, saveAIConversation, toggleMaterialBookmark, updateMaterialComment, upsertStudyProgress } from "./db";
import { invokeLLM } from "./_core/llm";

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
        activityDates: saved?.activityDates ? JSON.parse(saved.activityDates) : [],
        dailyTargetMinutes: saved?.dailyTargetMinutes ?? 30,
        reminderEnabled: saved?.reminderEnabled ?? 0,
        reminderTime: saved?.reminderTime ?? "19:00",
        attempts,
      };
    }),
    save: protectedProcedure.input(z.object({
      tasks: z.array(z.object({ id: z.number(), title: z.string(), meta: z.string(), done: z.boolean() })),
      completedMaterials: z.array(z.string()),
      weeklyActivity: z.record(z.string(), z.number().int().min(0)).default({}),
      activityDates: z.array(z.string()).default([]),
      dailyTargetMinutes: z.number().int().min(10).max(240),
      reminderEnabled: z.number().int().min(0).max(1).default(0),
      reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("19:00"),
    })).mutation(async ({ ctx, input }) => {
      return upsertStudyProgress({
        userId: ctx.user.id,
        taskState: JSON.stringify(input.tasks),
        completedMaterials: JSON.stringify(input.completedMaterials),
        weeklyActivity: JSON.stringify(input.weeklyActivity),
        activityDates: JSON.stringify(input.activityDates),
        dailyTargetMinutes: input.dailyTargetMinutes,
        reminderEnabled: input.reminderEnabled,
        reminderTime: input.reminderTime,
      });
    }),
  }),
  leaderboard: router({
    list: protectedProcedure.query(({ ctx }) => getLeaderboard(ctx.user.id)),
  }),
  quiz: router({
    submit: protectedProcedure.input(z.object({ quizKey: z.string().max(64), score: z.number().int().min(0), total: z.number().int().positive() })).mutation(({ ctx, input }) => addQuizAttempt({ userId: ctx.user.id, ...input })),
    recent: protectedProcedure.query(({ ctx }) => getRecentQuizAttempts(ctx.user.id)),
  }),
  admin: router({
    hiddenComments: adminProcedure.query(() => getHiddenMaterialComments()),
    restoreComment: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => moderateMaterialComment(input.id, "visible")),
    deleteComment: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteMaterialComment(input.id, 0, true)),
  }),
  materials: router({
    bookmarks: protectedProcedure.query(({ ctx }) => getBookmarkedSubjects(ctx.user.id)),
    toggleBookmark: protectedProcedure.input(z.object({ subject: z.string().min(1).max(120) })).mutation(({ ctx, input }) => toggleMaterialBookmark(ctx.user.id, input.subject)),
    comments: protectedProcedure.input(z.object({ subject: z.string().min(1).max(120) })).query(({ ctx, input }) => getMaterialComments(input.subject, ctx.user.id, ctx.user.role === "admin")),
    addComment: protectedProcedure.input(z.object({ subject: z.string().min(1).max(120), body: z.string().trim().min(2).max(1000) })).mutation(({ ctx, input }) => addMaterialComment({ userId: ctx.user.id, ...input })),
    updateComment: protectedProcedure.input(z.object({ id: z.number().int().positive(), body: z.string().trim().min(2).max(1000) })).mutation(({ ctx, input }) => updateMaterialComment(input.id, ctx.user.id, input.body)),
    deleteComment: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteMaterialComment(input.id, ctx.user.id, ctx.user.role === "admin")),
    moderateComment: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["visible", "hidden"]) })).mutation(({ input }) => moderateMaterialComment(input.id, input.status)),
    conversation: protectedProcedure.input(z.object({ subject: z.string().min(1).max(120) })).query(({ ctx, input }) => getAIConversation(ctx.user.id, input.subject)),
    askAI: protectedProcedure.input(z.object({ subject: z.string().min(1).max(120), question: z.string().trim().min(2).max(1000) })).mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({ messages: [
        { role: "system", content: "Kamu adalah Teman AI, pendamping belajar untuk pelajar SMK. Jawab dalam bahasa Indonesia yang sederhana, bertahap, dan tidak mengarang sumber. Jika pertanyaan di luar materi, arahkan kembali dengan sopan." },
        { role: "user", content: `Materi: ${input.subject}\nPertanyaan: ${input.question}` },
      ] });
      const answer = String(response.choices[0]?.message?.content ?? "Maaf, jawaban AI belum tersedia.");
      await saveAIConversation(ctx.user.id, input.subject, [{ role: "user", message: input.question }, { role: "assistant", message: answer }]);
      return { answer };
    }),
  }),
});

export type AppRouter = typeof appRouter;
