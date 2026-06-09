// AWS Bedrock provider — stubbed. Implemented in Phase 7.
// Must expose the same complete(prompt) interface as providers/anthropic.js so
// that swapping LLM_PROVIDER=bedrock requires no tool-code changes.

// eslint-disable-next-line no-unused-vars
export async function complete(prompt, opts = {}) {
  throw new Error(
    'Bedrock provider not implemented yet (Phase 7). Set LLM_PROVIDER=anthropic.'
  );
}
