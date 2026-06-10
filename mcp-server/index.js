import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import * as exercises from './tools/exercises.js';
import * as library from './tools/library.js';
import * as insights from './tools/insights.js';

// MCP server entry. Registers all 10 tools and connects over stdio.
// Tools return { data, error }; we forward that as JSON text content so the
// caller (the app or Claude) always sees a consistent shape.

const server = new McpServer({
  name: 'resistance-tracker',
  version: '0.1.0',
});

// Wrap a tool fn so its { data, error } result becomes MCP text content.
function asContent(result) {
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
}

// ---- Supabase: exercises -------------------------------------------------

server.registerTool(
  'get_exercises',
  {
    description: "Fetch a user's logged exercises (newest first), with optional date range.",
    inputSchema: {
      user_id: z.string(),
      start_date: z.string().nullable().optional(),
      end_date: z.string().nullable().optional(),
    },
  },
  async (args) => asContent(await exercises.get_exercises(args))
);

server.registerTool(
  'log_exercise',
  {
    description: 'Insert one new exercise row for a user.',
    inputSchema: {
      user_id: z.string(),
      exercise: z.object({
        name: z.string(),
        type: z.string(),
        date: z.string(),
        sets: z.number().nullable().optional(),
        reps: z.number().nullable().optional(),
        weight: z.string().nullable().optional(),
        unit: z.string().optional(),
        is_max_weight: z.boolean().optional(),
        is_max_reps: z.boolean().optional(),
        notes: z.string().nullable().optional(),
      }),
    },
  },
  async (args) => asContent(await exercises.log_exercise(args))
);

server.registerTool(
  'update_exercise',
  {
    description: 'Edit an existing exercise row (scoped to the owning user).',
    inputSchema: {
      user_id: z.string(),
      id: z.string(),
      updates: z.record(z.any()),
    },
  },
  async (args) => asContent(await exercises.update_exercise(args))
);

server.registerTool(
  'delete_exercise',
  {
    description: 'Delete an exercise row (scoped to the owning user).',
    inputSchema: {
      user_id: z.string(),
      id: z.string(),
    },
  },
  async (args) => asContent(await exercises.delete_exercise(args))
);

// ---- Supabase: library + aggregation -------------------------------------

server.registerTool(
  'get_exercise_library',
  {
    description: 'Fetch the full shared exercise catalog (read-only).',
    inputSchema: {},
  },
  async () => asContent(await library.get_exercise_library())
);

server.registerTool(
  'get_progress_by_muscle',
  {
    description: "Aggregate a user's sets/reps/sessions by primary muscle group over an optional date range.",
    inputSchema: {
      user_id: z.string(),
      start_date: z.string().nullable().optional(),
      end_date: z.string().nullable().optional(),
    },
  },
  async (args) => asContent(await library.get_progress_by_muscle(args))
);

server.registerTool(
  'add_library_exercise',
  {
    description: 'Add a new exercise to the shared catalog (admin only). Rejects duplicate names; type must be Upper Body, Lower Body, Abs, or Peak 8.',
    inputSchema: {
      user_id: z.string(),
      name: z.string(),
      type: z.string(),
      primary_muscle: z.string(),
      secondary_muscles: z.array(z.string()).nullable().optional(),
      equipment: z.string().nullable().optional(),
      movement_pattern: z.string().nullable().optional(),
    },
  },
  async (args) => asContent(await library.add_library_exercise(args))
);

// ---- LLM: insights -------------------------------------------------------

server.registerTool(
  'generate_weekly_digest',
  {
    description: 'Summarize the last 7 days of exercises into a plain-English paragraph.',
    inputSchema: {
      exercises: z.array(z.any()),
    },
  },
  async (args) => asContent(await insights.generate_weekly_digest(args))
);

server.registerTool(
  'generate_muscle_insight',
  {
    description: 'Turn muscle-coverage data into a short coaching insight.',
    inputSchema: {
      coverage: z.array(z.any()),
    },
  },
  async (args) => asContent(await insights.generate_muscle_insight(args))
);

server.registerTool(
  'explain_suggestion',
  {
    description: "Explain why each exercise in today's suggested session was chosen.",
    inputSchema: {
      suggestion: z.array(z.any()),
    },
  },
  async (args) => asContent(await insights.explain_suggestion(args))
);

// ---- Connect -------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
