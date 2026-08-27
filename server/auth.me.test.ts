import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("auth.me", () => {
  it("returns the authenticated user from the request context", async () => {
    const user = {
      id: 42,
      openId: "flow-test-user",
      email: "flow@example.com",
      name: "Flow Test",
      loginMethod: "manus",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const ctx = {
      user,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } satisfies TrpcContext;

    await expect(appRouter.createCaller(ctx).auth.me()).resolves.toEqual(user);
  });
});

