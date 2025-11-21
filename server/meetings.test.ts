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

describe("meetings router", () => {
  it("should list meetings for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const meetings = await caller.meetings.list();
    
    expect(Array.isArray(meetings)).toBe(true);
  });

  it("should create meeting without file", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const meeting = await caller.meetings.create({
      title: "Test Meeting",
      description: "Test Description"
    });

    expect(meeting).toBeDefined();
    expect(meeting.title).toBe("Test Meeting");
    expect(meeting.userId).toBe(ctx.user!.id);
    expect(meeting.status).toBe("pending");
  });
});

describe("interviews router", () => {
  it("should list interviews for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const interviews = await caller.interviews.list();
    
    expect(Array.isArray(interviews)).toBe(true);
  });

  it("should create interview", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const interview = await caller.interviews.create({
      candidateName: "Test Candidate",
      position: "Software Engineer"
    });

    expect(interview).toBeDefined();
    expect(interview.candidateName).toBe("Test Candidate");
    expect(interview.userId).toBe(ctx.user!.id);
    expect(interview.status).toBe("pending");
  });
});

describe("tasks router", () => {
  it("should list tasks for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tasks = await caller.tasks.list();
    
    expect(Array.isArray(tasks)).toBe(true);
  });
});

describe("knowledge router", () => {
  it("should list knowledge base books", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const books = await caller.knowledge.list();
    
    expect(Array.isArray(books)).toBe(true);
  });
});
