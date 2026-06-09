import Anthropic from '@anthropic-ai/sdk';

// Anthropic provider. Implements the complete(prompt) interface that lib/llm.js
// routes to. Bedrock will implement the same interface in Phase 7.

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY (required when LLM_PROVIDER=anthropic).');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

// complete(prompt) -> string. Throws on API error; callers wrap in {data,error}.
export async function complete(prompt, { maxTokens = 1024 } = {}) {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  return res.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
}
