import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

export const AI_MODELS = {
  classifier: process.env.OPENAI_TREND_CLASSIFIER_MODEL ?? "gpt-4o-mini",
  forecaster: process.env.OPENAI_TREND_FORECAST_MODEL ?? "gpt-4o",
  personalizer: process.env.OPENAI_PERSONALIZATION_MODEL ?? "gpt-4o-mini",
  influencerMatcher: process.env.OPENAI_INFLUENCER_MATCH_MODEL ?? "gpt-4o-mini",
  contentPrimary: process.env.ANTHROPIC_CONTENT_MODEL ?? "claude-sonnet-4-20250514",
  contentFallback: process.env.OPENAI_CONTENT_FALLBACK_MODEL ?? "gpt-4o-mini",
};

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openaiClient;
}

export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  return anthropicClient;
}
