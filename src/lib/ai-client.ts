/**
 * Unified AI Client for Marriage Media.
 * Uses OpenAI API (configurable via OPENAI_API_KEY and OPENAI_MODEL env vars).
 * Falls back to rule-based generation if API key is not set.
 */

import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "sk-your-openai-api-key") return null;
  if (!client) {
    client = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return client;
}

export const AI_AVAILABLE = !!getClient();

/**
 * Send a chat completion request to OpenAI.
 */
export async function chatCompletion(params: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const ai = getClient();
  if (!ai) {
    throw new Error("AI service not configured. Set OPENAI_API_KEY in .env.local");
  }

  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    max_tokens: params.maxTokens || 1024,
    temperature: params.temperature ?? 0.7,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Parse a JSON response from OpenAI, handling markdown code blocks.
 */
export function parseAIJson<T>(text: string): T {
  // Remove markdown code block wrappers if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();
  return JSON.parse(cleaned) as T;
}