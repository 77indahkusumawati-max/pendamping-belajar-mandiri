import { describe, expect, it } from "vitest";
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
});

