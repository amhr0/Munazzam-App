import { describe, expect, it } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("API Keys Validation", () => {
  it("should validate OpenAI API key", async () => {
    const response = await invokeLLM({
      messages: [
        { role: "user", content: "Say 'test successful' in Arabic" },
      ],
      model: "gpt-3.5-turbo",
    });

    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]?.message.content).toBeTruthy();
  }, 30000);

  it("should validate DeepSeek API key", async () => {
    // DeepSeek uses OpenAI-compatible API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: "Test" }],
      }),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.choices).toBeDefined();
  }, 30000);

  it("should validate Gemini API key", async () => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Test" }] }],
        }),
      }
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.candidates).toBeDefined();
  }, 30000);

  it("should validate Google API key", async () => {
    // Test with a simple API call (e.g., geocoding)
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=Riyadh&key=${process.env.GOOGLE_API_KEY}`
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.status).toBe("OK");
  }, 30000);
});
