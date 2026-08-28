import { describe, expect, it } from "vitest";
import { vi } from "vitest";
vi.mock("./storage", () => ({ storagePut: vi.fn(async () => ({ key: "test/material.txt", url: "/manus-storage/test/material.txt" })), storageGetSignedUrl: vi.fn(async () => "https://example.test/test.pdf") }));
vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn(async () => ({ choices: [{ message: { content: JSON.stringify({ summary: "Ringkasan PDF yang cukup panjang untuk memenuhi validasi hasil ekstraksi AI.", quiz: Array.from({ length: 5 }, (_, index) => ({ question: `Soal ${index + 1} materi`, options: ["A", "B", "C", "D"], answerIndex: 0, explanation: "Penjelasan jawaban berdasarkan materi." })) }) } }] })) }));
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthenticatedContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

function authenticatedContext(role: "user" | "admin" = "user"): TrpcContext {
  return { user: { id: 42, openId: "test-user", name: "Test User", role } as TrpcContext["user"], req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("material collaboration routes", () => {
  it("protects bookmarks and comments", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.materials.bookmarks()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.materials.comments({ subject: "Basis Data" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.materials.addComment({ subject: "Basis Data", body: "Apa itu primary key?" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("protects the AI learning assistant and conversation history", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.materials.askAI({ subject: "Basis Data", question: "Apa itu primary key?" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.materials.conversation({ subject: "Basis Data" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.uploads.extract({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("protects comment update and delete routes", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.materials.updateComment({ id: 1, body: "Pertanyaan baru" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.materials.deleteComment({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("restricts moderation to administrators before database access", async () => {
    const caller = appRouter.createCaller(authenticatedContext("user"));
    await expect(caller.materials.moderateComment({ id: 1, status: "hidden" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("validates moderation status values", async () => {
    const caller = appRouter.createCaller(authenticatedContext("admin"));
    await expect(caller.materials.moderateComment({ id: 1, status: "blocked" as "hidden" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("protects the admin hidden-comment dashboard", async () => {
    const caller = appRouter.createCaller(authenticatedContext("user"));
    await expect(caller.admin.hiddenComments()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.restoreComment({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.deleteComment({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("protects editor and upload procedures", async () => {
    const caller = appRouter.createCaller(authenticatedContext("user"));
    await expect(caller.admin.materials()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.saveMaterial({ subject: "X", title: "X", summary: "terlalu pendek", steps: "x", source: "x", level: "SMK", difficulty: "Pemula", track: "Teknologi" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.uploads.create({ title: "Materi", fileName: "materi.exe", mimeType: "application/x-executable" as "application/pdf", sizeBytes: 10, dataBase64: "aGVsbG8gd29ybGQgdGVzdCBtYXRlcmlhbCB1cGxvYWQ=" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("reads the new editor, preference, and upload surfaces", async () => {
    const adminCaller = appRouter.createCaller(authenticatedContext("admin"));
    const userCaller = appRouter.createCaller(authenticatedContext("user"));
    await expect(adminCaller.admin.materials()).resolves.toBeInstanceOf(Array);
    await expect(userCaller.preferences.get()).resolves.toHaveProperty("preferredTrack");
    await expect(userCaller.uploads.list()).resolves.toBeInstanceOf(Array);
  });

  it("extracts a valid PDF into a summary and five-question quiz", async () => {
    const caller = appRouter.createCaller(authenticatedContext("user"));
    const created = await caller.uploads.create({ title: "PDF Ekstraksi Uji", fileName: "ekstraksi.pdf", mimeType: "application/pdf", sizeBytes: 24, dataBase64: "aGVsbG8gd29ybGQgdGVzdCBwZGYgY29udGVudA==" });
    const upload = created.find((item) => item.title === "PDF Ekstraksi Uji");
    expect(upload).toBeTruthy();
    const extracted = await caller.uploads.extract({ id: upload!.id });
    expect(extracted.quiz).toHaveLength(5);
    expect(extracted.summary).toContain("Ringkasan PDF");
    await caller.uploads.delete({ id: upload!.id });
  });

  it("accepts valid editor, preference, and upload mutations", async () => {
    const adminCaller = appRouter.createCaller(authenticatedContext("admin"));
    const userCaller = appRouter.createCaller(authenticatedContext("user"));
    const subject = `Test Materi ${Date.now()}`;
    await expect(adminCaller.admin.saveMaterial({ subject, title: "Materi Uji", summary: "Ringkasan materi uji yang cukup panjang", steps: "Langkah pertama\\nLangkah kedua", source: "Sumber internal", level: "SMK", difficulty: "Pemula", track: "Teknologi" })).resolves.toBeInstanceOf(Array);
    await expect(userCaller.preferences.save({ interests: ["Teknologi"], preferredTrack: "Teknologi" })).resolves.toHaveProperty("preferredTrack", "Teknologi");
    await expect(userCaller.uploads.create({ title: "Catatan Uji", fileName: "catatan.txt", mimeType: "text/plain", sizeBytes: 11, dataBase64: "aGVsbG8gd29ybGQgdGVzdCBtYXRlcmlhbCB1cGxvYWQ=" })).resolves.toBeInstanceOf(Array);
    const created = (await adminCaller.admin.materials()).find((material) => material.subject === subject);
    if (created) await adminCaller.admin.deleteMaterial({ id: created.id });
  });
});

