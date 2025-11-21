import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("integrations router", () => {
  it("should list user integrations", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const integrations = await caller.integrations.list();
    
    expect(Array.isArray(integrations)).toBe(true);
  });

  it("should generate Google auth URL", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.integrations.getAuthUrl({ provider: "google" });
    
    expect(result).toHaveProperty('url');
    expect(result.url).toContain('accounts.google.com');
    expect(result.url).toContain('oauth2');
  });

  it("should generate Microsoft auth URL", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.integrations.getAuthUrl({ provider: "microsoft" });
    
    expect(result).toHaveProperty('url');
    expect(result.url).toContain('login.microsoftonline.com');
    expect(result.url).toContain('oauth2');
  });
});

describe("calendar router", () => {
  it("should list calendar events for user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const events = await caller.calendar.list();
    
    expect(Array.isArray(events)).toBe(true);
  });
});

describe("emails router", () => {
  it("should list emails for user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const emails = await caller.emails.list();
    
    expect(Array.isArray(emails)).toBe(true);
  });

  it("should respect limit parameter", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const emails = await caller.emails.list({ limit: 10 });
    
    expect(Array.isArray(emails)).toBe(true);
    expect(emails.length).toBeLessThanOrEqual(10);
  });
});
