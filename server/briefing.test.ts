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

describe("briefing router", () => {
  it("should generate daily briefing for authenticated user", { timeout: 30000 }, async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const briefing = await caller.briefing.today();
    
    expect(briefing).toBeDefined();
    expect(briefing.date).toBeDefined();
    expect(briefing.summary).toBeDefined();
    expect(briefing.stats).toBeDefined();
    expect(briefing.recommendations).toBeDefined();
    expect(Array.isArray(briefing.recommendations)).toBe(true);
  });

  it("should have valid stats structure", { timeout: 30000 }, async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const briefing = await caller.briefing.today();
    
    expect(briefing.stats).toHaveProperty('totalMeetings');
    expect(briefing.stats).toHaveProperty('completedMeetings');
    expect(briefing.stats).toHaveProperty('totalInterviews');
    expect(briefing.stats).toHaveProperty('completedInterviews');
    expect(briefing.stats).toHaveProperty('totalTasks');
    expect(briefing.stats).toHaveProperty('completedTasks');
    expect(briefing.stats).toHaveProperty('urgentTasks');
    
    expect(typeof briefing.stats.totalMeetings).toBe('number');
    expect(typeof briefing.stats.urgentTasks).toBe('number');
  });

  it("should include urgent and upcoming tasks", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const briefing = await caller.briefing.today();
    
    expect(Array.isArray(briefing.urgentTasks)).toBe(true);
    expect(Array.isArray(briefing.upcomingTasks)).toBe(true);
    expect(Array.isArray(briefing.recentMeetings)).toBe(true);
    expect(Array.isArray(briefing.recentInterviews)).toBe(true);
  });

  it("should refresh briefing", { timeout: 30000 }, async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const briefing = await caller.briefing.refresh();
    
    expect(briefing).toBeDefined();
    expect(briefing.date).toBeDefined();
    expect(briefing.summary).toBeDefined();
  });
});
