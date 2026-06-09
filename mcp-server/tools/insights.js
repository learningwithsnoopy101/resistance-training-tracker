import llm from '../lib/llm.js';

// LLM-powered insight tools. All call llm.complete() — never a provider SDK
// directly — so they work unchanged when the provider is swapped (Phase 7).
// Each returns the consistent { data, error } shape.

// generate_weekly_digest — last 7 days of exercises -> plain-English paragraph.
export async function generate_weekly_digest({ exercises }) {
  if (!Array.isArray(exercises)) {
    return { data: null, error: 'exercises array is required' };
  }
  if (exercises.length === 0) {
    return { data: 'No sessions logged in the past week.', error: null };
  }

  const prompt =
    'You are a supportive strength-training coach. Summarize this past week of ' +
    'logged workouts in one short, encouraging paragraph (no lists, no bold). ' +
    'Be honest if volume was low.\n\n' +
    `Exercises (JSON):\n${JSON.stringify(exercises, null, 2)}`;

  try {
    const text = await llm.complete(prompt);
    return { data: text, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// generate_muscle_insight — muscle coverage data -> coaching insight string.
export async function generate_muscle_insight({ coverage }) {
  if (!Array.isArray(coverage)) {
    return { data: null, error: 'coverage array is required' };
  }
  if (coverage.length === 0) {
    return { data: 'Not enough data yet to assess muscle coverage.', error: null };
  }

  const prompt =
    'You are a strength-training coach reviewing muscle-group coverage. Given ' +
    'this per-muscle training data, write 2-3 sentences of balanced, actionable ' +
    'insight (no lists). Call out any clearly undertrained groups.\n\n' +
    `Coverage (JSON):\n${JSON.stringify(coverage, null, 2)}`;

  try {
    const text = await llm.complete(prompt);
    return { data: text, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// explain_suggestion — today's suggested session -> why each pick was chosen.
export async function explain_suggestion({ suggestion }) {
  if (!Array.isArray(suggestion)) {
    return { data: null, error: 'suggestion array is required' };
  }
  if (suggestion.length === 0) {
    return { data: 'No suggestions to explain.', error: null };
  }

  const prompt =
    'You are a strength-training coach. For each exercise in this suggested ' +
    'session, give a one-sentence reason it was chosen (recovery, muscle balance, ' +
    'movement pattern). Keep it concise and friendly.\n\n' +
    `Suggested session (JSON):\n${JSON.stringify(suggestion, null, 2)}`;

  try {
    const text = await llm.complete(prompt);
    return { data: text, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}
