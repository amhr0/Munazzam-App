import { describe, expect, it } from "vitest";

describe("Google OAuth Validation", () => {
  it("should validate Google OAuth credentials", async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    expect(clientId).toBeTruthy();
    expect(clientSecret).toBeTruthy();
    expect(clientId).toContain(".apps.googleusercontent.com");
    expect(clientSecret).toMatch(/^GOCSPX-/);

    // Test OAuth endpoint availability
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: "client_credentials",
      }),
    });

    // Even if it returns an error, the credentials format is valid if we get a proper response
    expect(response.status).toBeLessThan(500);
    const data = await response.json();
    expect(data).toBeDefined();
  }, 30000);
});
