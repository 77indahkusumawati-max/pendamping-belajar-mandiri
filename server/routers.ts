import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { addMaterialComment, addQuizAttempt, deleteMaterialComment, getAIConversation, getBookmarkedSubjects, getHiddenMaterialComments, getLeaderboard, getManagedMaterials, getMaterialComments, getRecentQuizAttempts, getStudyPreferences, getStudyProgress, getUploadedMaterials, getUploadedMaterial, deleteUploadedMaterial, saveUploadedExtraction, moderateMaterialComment, saveAIConversation, saveUploadedMaterial, toggleMaterialBookmark, updateMaterialComment, upsertManagedMaterial, upsertStudyPreferences, upsertStudyProgress, deleteManagedMaterial } from "./db";
import { storageGetSignedUrl, storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";

const extractedStudySchema = z.object({ summary: z.string().trim().min(20).max(2000), quiz: z.array(z.object({ question: z.string().trim().min(5), options: z.array(z.string().trim().min(1)).length(4), answerIndex: z.number().int().min(0).max(3), explanation: z.string().trim().min(5) })).length(5) });

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
    materials: adminProcedure.query(() => getManagedMaterials()),
    saveMaterial: adminProcedure.input(z.object({ id: z.number().int().positive().optional(), subject: z.string().trim().min(2).max(120), title: z.string().trim().min(2).max(180), summary: z.string().trim().min(10).max(3000), steps: z.string().trim().min(10).max(10000), source: z.string().trim().min(2).max(255), level: z.enum(["TK", "SD", "SMP", "SMA", "SMK", "Kuliah"]), difficulty: z.enum(["Pemula", "Menengah", "Lanjutan"]), track: z.string().trim().min(2).max(80) })).mutation(({ ctx, input }) => upsertManagedMaterial({ ...input, createdBy: ctx.user.id })),
    deleteMaterial: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteManagedMaterial(input.id)),
    restoreComment: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => moderateMaterialComment(input.id, "visible")),
    deleteComment: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteMaterialComment(input.id, 0, true)),
  }),
  preferences: router({
    get: protectedProcedure.query(({ ctx }) => getStudyPreferences(ctx.user.id)),
    save: protectedProcedure.input(z.object({ interests: z.array(z.string().min(1).max(80)).max(10), preferredTrack: z.string().min(1).max(80) })).mutation(({ ctx, input }) => upsertStudyPreferences({ userId: ctx.user.id, interests: JSON.stringify(input.interests), preferredTrack: input.preferredTrack })),
  }),
  uploads: router({
    list: protectedProcedure.query(({ ctx }) => getUploadedMaterials(ctx.user.id)),
    create: protectedProcedure.input(z.object({ title: z.string().trim().min(2).max(180), fileName: z.string().trim().min(1).max(255), mimeType: z.enum(["text/plain", "text/markdown", "application/pdf"]), sizeBytes: z.number().int().positive().max(5_000_000), dataBase64: z.string().min(20).max(7_000_000) })).mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.dataBase64, "base64");
      if (buffer.length > 5_000_000) throw new Error("Ukuran materi maksimal 5 MB");
      const stored = await storagePut(`user-materials/${ctx.user.id}/${input.fileName}`, buffer, input.mimeType);
      return saveUploadedMaterial({ userId: ctx.user.id, title: input.title, fileName: input.fileName, mimeType: input.mimeType, sizeBytes: buffer.length, fileKey: stored.key, fileUrl: stored.url });
    }),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => deleteUploadedMaterial(ctx.user.id, input.id)),
    extract: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const upload = await getUploadedMaterial(ctx.user.id, input.id);
      if (!upload) throw new TRPCError({ code: "NOT_FOUND", message: "Materi unggahan tidak ditemukan" });
      if (upload.mimeType !== "application/pdf") throw new TRPCError({ code: "BAD_REQUEST", message: "Ekstraksi AI saat ini hanya mendukung PDF" });
      let pdfUrl: string;
      try { pdfUrl = await storageGetSignedUrl(upload.fileKey); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "PDF belum dapat diakses dari penyimpanan. Coba unggah ulang file." }); }
      let response;
      try { response = await invokeLLM({ messages: [
        { role: "system", content: "Kamu adalah penyusun materi belajar berbahasa Indonesia. Baca PDF yang diberikan, lalu keluarkan JSON valid sesuai schema: ringkasan singkat maksimal 120 kata dan tepat 5 soal pilihan ganda. Setiap soal memiliki question, options berisi 4 pilihan, answerIndex dari 0 sampai 3, dan explanation. Jangan mengarang isi di luar PDF." },
        { role: "user", content: [{ type: "text", text: "Ekstrak materi PDF ini menjadi ringkasan dan kuis interaktif untuk pelajar." }, { type: "file_url", file_url: { url: pdfUrl, mime_type: "application/pdf" } }] },
      ], response_format: { type: "json_object" } }); } catch { throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Teman AI belum dapat memproses PDF saat ini. Silakan coba lagi nanti." }); }
      const raw = response.choices[0]?.message?.content;
      try {
        const parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
        const result = extractedStudySchema.parse(parsed);
        await saveUploadedExtraction(ctx.user.id, input.id, result.summary, JSON.stringify(result.quiz));
        return result;
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "AI belum dapat membaca PDF menjadi ringkasan dan kuis yang valid. Coba unggah PDF yang lebih jelas." });
      }
    }),
  }),
  materials: router({
    managed: protectedProcedure.query(() => getManagedMaterials()),
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
