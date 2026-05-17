import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "placeholder",
    });
  }
  return _anthropic;
}

export const AI_MODEL = "claude-3-5-sonnet-20241022";
