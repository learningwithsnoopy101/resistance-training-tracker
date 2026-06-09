// LLM abstraction layer. Reads LLM_PROVIDER from env and routes complete()
// calls to the correct provider. Tool code calls llm.complete(prompt) only —
// never a provider SDK directly. Swapping providers = change one env var.

import * as anthropic from './providers/anthropic.js';
import * as bedrock from './providers/bedrock.js';

const PROVIDERS = {
  anthropic,
  bedrock,
};

function getProvider() {
  const name = (process.env.LLM_PROVIDER || 'anthropic').toLowerCase();
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(
      `Unknown LLM_PROVIDER "${name}". Valid options: ${Object.keys(PROVIDERS).join(', ')}.`
    );
  }
  return provider;
}

export async function complete(prompt, opts = {}) {
  return getProvider().complete(prompt, opts);
}

export default { complete };
