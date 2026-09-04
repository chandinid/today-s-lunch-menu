const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

/**
 * Calls Claude (Anthropic's API directly — this app runs off Lovable's hosting now, so it
 * needs its own AI key rather than Lovable's built-in gateway) with a system prompt + user
 * content, and returns the parsed JSON object from its reply.
 *
 * Claude is instructed (via the system prompt) to respond with ONLY JSON, but we defensively
 * strip a markdown code fence in case the model wraps its answer in one anyway.
 */
export async function callClaudeForJson(
  systemPrompt: string,
  userContent: string,
  { maxTokens = 4096 }: { maxTokens?: number } = {},
): Promise<unknown> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project (missing ANTHROPIC_API_KEY)");

  const res = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude request failed [${res.status}]: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((block) => block.type === "text")?.text ?? "";
  const jsonText = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  try {
    return JSON.parse(jsonText);
  } catch {
    throw new Error(`Claude did not return valid JSON: ${jsonText.slice(0, 300)}`);
  }
}
