// Manual test client for the MCP server.
//
// Usage:
//   node test-client.mjs                      → lists tools, calls get_exercise_library
//   node test-client.mjs <user_id>            → also calls get_exercises for that user
//
// Reads .env via the same process, spawns index.js over stdio, calls tools,
// prints results. Safe to delete when you're done testing.

import 'dotenv/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const userId = process.argv[2] || null;

const transport = new StdioClientTransport({
  command: 'node',
  args: ['index.js'],
  env: process.env, // passes through your real .env-loaded keys
});

const client = new Client({ name: 'manual-test', version: '1.0.0' });
await client.connect(transport);

// Helper: call a tool and pretty-print the { data, error } it returns.
async function call(name, args = {}) {
  console.log(`\n=== ${name}(${JSON.stringify(args)}) ===`);
  const res = await client.callTool({ name, arguments: args });
  const payload = JSON.parse(res.content[0].text);
  if (payload.error) {
    console.log('ERROR:', payload.error);
  } else {
    const d = payload.data;
    if (Array.isArray(d)) {
      console.log(`OK — ${d.length} rows. First row:`, d[0] ?? '(none)');
    } else {
      console.log('OK —', d);
    }
  }
}

// 1. List registered tools.
const { tools } = await client.listTools();
console.log('Registered tools:', tools.map((t) => t.name).join(', '));

// 2. Read-only test — no user_id needed.
await call('get_exercise_library');

// 3. If a user_id was passed, test the per-user read.
if (userId) {
  await call('get_exercises', { user_id: userId });
  await call('get_progress_by_muscle', { user_id: userId });
} else {
  console.log('\n(Tip: pass your user_id as an argument to test get_exercises too.)');
}

await client.close();
process.exit(0);
