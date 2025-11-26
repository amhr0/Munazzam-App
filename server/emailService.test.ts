import { describe, expect, it } from "vitest";
import { testEmailConnection } from "./services/emailService";

describe("Email Service", () => {
  it("should verify Gmail SMTP connection", async () => {
    const result = await testEmailConnection();
    expect(result).toBe(true);
  }, 15000); // 15 seconds timeout for network request
});
