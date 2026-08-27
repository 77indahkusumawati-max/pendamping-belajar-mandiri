import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("progress routes", () => {
  it("rejects progress reads without an authenticated user", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.progress.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects quiz submissions without an authenticated user", async () => {
    const caller = appRouter.createCaller(createUnauthenticatedContext());
    await expect(caller.quiz.submit({ quizKey: "fungsi-kuadrat", score: 2, total: 7 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
