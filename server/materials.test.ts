import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthenticatedContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("material collaboration routes", () => {
  it("protects bookmarks and comments", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.materials.bookmarks()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.materials.comments({ subject: "Basis Data" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.materials.addComment({ subject: "Basis Data", body: "Apa itu primary key?" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("protects the AI learning assistant", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.materials.askAI({ subject: "Basis Data", question: "Apa itu primary key?" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

