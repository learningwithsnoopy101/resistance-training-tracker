# mcp-server — CLAUDE.md

Scoped rules for the MCP server module. Read before editing anything in `mcp-server/`.

## What this is

A standalone Node.js MCP server abstracting Supabase + LLM access for the
resistance training tracker. Runs locally over **stdio**. Built in Phase 1 of
`ROADMAP.md`. The React app does **not** call it yet — that wiring is Phase 3.

## Conventions

- **Tool naming:** `verb_noun` in snake_case (e.g. `get_exercises`, `generate_weekly_digest`).
- **Return shape:** every tool returns `{ data, error }`. On success, `error` is `null`. On failure, `data` is `null` and `error` is a human-readable string (the Claude API / app will surface it).
- **Secrets via env only:** all Supabase + LLM credentials come from env vars (`.env`). Never hardcode keys. `.env` is gitignored; `.env.example` documents the vars.
- **Service-role key:** the Supabase client uses the service-role key and bypasses RLS. Therefore every data tool MUST scope queries by `user_id` explicitly. Never trust the DB to filter by user.
- **LLM access:** insight tools call `llm.complete(prompt)` from `lib/llm.js` only — never a provider SDK directly. This keeps the Anthropic → Bedrock swap (Phase 7) a one-env-var change.
- **ES modules:** `"type": "module"` — use `import`, top-level `await` is allowed.

## Layout

```
index.js              registers all 9 tools, connects stdio transport
tools/
  exercises.js        get_exercises, log_exercise, update_exercise, delete_exercise
  library.js          get_exercise_library, get_progress_by_muscle
  insights.js         generate_weekly_digest, generate_muscle_insight, explain_suggestion
lib/
  supabase.js         service-role client (env vars only)
  llm.js              provider router — exposes complete()
  providers/
    anthropic.js      real Anthropic client
    bedrock.js        stub (Phase 7)
```

## Avoid

- Do not hardcode Supabase URL/keys or the Anthropic key.
- Do not call the Anthropic SDK from tool code — go through `lib/llm.js`.
- Do not skip the `user_id` scope on data queries (service-role bypasses RLS).
- Do not import the app's `lib/supabase.js` — this module has its own.

## Run

```bash
npm install
cp .env.example .env   # then fill in the service-role + Anthropic keys
npm start              # boots the stdio server
npm run check          # node --check index.js
```
