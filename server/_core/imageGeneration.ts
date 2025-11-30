/**
 * Image generation using OpenAI DALL-E API
 */

import { ENV } from "./env";

export type ImageGenerationOptions = {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
};

export type ImageGenerationResult = {
  url: string;
  revisedPrompt?: string;
};

/**
 * Generate an image using OpenAI DALL-E 3
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  if (!ENV.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ENV.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: options.prompt,
      n: 1,
      size: options.size || "1024x1024",
      quality: options.quality || "standard",
      style: options.style || "vivid",
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(
      `Image generation failed (${response.status} ${response.statusText})${error ? `: ${error}` : ""}`
    );
  }

  const result = await response.json();
  return {
    url: result.data[0].url,
    revisedPrompt: result.data[0].revised_prompt,
  };
}
