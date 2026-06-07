# .claude — Claude Code configuration

This folder contains Claude Code project settings. Read this file to understand what each setting does before making changes.

## settings.json

### permissions.deny
Prevents Claude from editing `lib/supabase.js` under any circumstances.

**Why:** That file holds the Supabase project URL and database credentials. It almost never needs to change, and an accidental edit could break the database connection for all users including on the live site.

---

### hooks — PreToolUse
**Trigger:** Before any file edit or write  
**What it does:** Double-checks that the file being edited is not `lib/supabase.js`. If it is, the edit is blocked and a clear error message is returned.

**Why two layers (permission rule + hook)?** The permission rule is the clean gate. The hook adds a human-readable error message so the reason for the block is obvious.

---

### hooks — PostToolUse
**Trigger:** After any `.jsx` file is edited  
**What it does:** Automatically runs `npm run build` in the background.

**Why:** Catches broken JSX immediately after a file is saved — before it reaches `npm run deploy` and breaks the live site. Fail fast, fix while the change is fresh.

**Note:** In the VS Code extension the build runs silently when it succeeds. You will only see output if the build fails. In terminal Claude Code (`claude` command) the output is visible.

---

## Adding new hooks

Follow this pattern before writing any new hook to settings.json:
1. Test the command manually in the terminal first
2. Add it to settings.json
3. Type `/hooks` in Claude Code to reload
4. Verify it fires on a test edit
