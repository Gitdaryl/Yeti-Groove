#!/usr/bin/env node
// Pull a live ElevenLabs agent into its config file, so the repo tells the truth.
//
//   node tools/agent-pull.mjs manitou-beach
//   node tools/agent-pull.mjs --all
//
// Why this exists. On 2026-09-04 the committed config for the Manitou Beach
// concierge claimed tools: [], tool_ids: [] and rag.enabled: false, while the
// live agent had seven tools. Nobody was lying; the config had simply been
// exported once and then edited in a dashboard for five months. A file that
// disagrees with production is worse than no file, because it gets trusted.
//
// It also expands tool_ids into the full tool definitions. A diff that says
// tool_ids changed from ["tool_4201..."] to ["tool_9f3b..."] tells a reviewer
// nothing. One that shows a URL and a description tells them everything.

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { API, call, loadRegistry, pick, summarise, printSummary } from './_agents-lib.mjs';

const args = process.argv.slice(2);
const all = args.includes('--all');
const reg = loadRegistry();
const targets = all ? reg.agents : [pick(reg, args.find((a) => !a.startsWith('--')))];

for (const a of targets) {
  console.log(`\n  ${a.name}  (${a.agentId})`);

  const cfg = await call(`${API}/agents/${a.agentId}`);

  // Expand the referenced tools so the file is self-contained and reviewable.
  // Tools are separate resources in ElevenLabs, so this is a second round trip
  // per tool. Kept under a leading underscore: agent-push strips those before
  // sending, so the expansion can never be mistaken for something writable.
  const ids = cfg?.conversation_config?.agent?.prompt?.tool_ids ?? [];
  if (ids.length) {
    const expanded = [];
    for (const id of ids) {
      try {
        expanded.push(await call(`${API}/tools/${id}`));
      } catch {
        // Deliberately soft: if the tools endpoint moves or the id is stale we
        // still want the agent config on disk. Record the gap instead of losing
        // the whole pull, and say so out loud rather than writing a quiet null.
        console.log(`    could not expand tool ${id}, recording a placeholder`);
        expanded.push({ id, _error: 'could not be expanded at pull time' });
      }
    }
    cfg._tools = expanded;
    cfg._toolsNote =
      'Expanded from tool_ids for review only. Stripped automatically by agent-push.mjs. ' +
      'Edit tools in the ElevenLabs dashboard or via the tools API, not here.';
  }

  cfg._pulledAt = new Date().toISOString();
  cfg._pulledBy = 'tools/agent-pull.mjs';

  mkdirSync(path.dirname(a.resolvedPath), { recursive: true });
  writeFileSync(a.resolvedPath, `${JSON.stringify(cfg, null, 2)}\n`);

  printSummary(`written to ${a.resolvedPath}`, summarise(cfg));
  if (cfg._tools?.length) {
    console.log('    tool detail');
    for (const t of cfg._tools) {
      const url = t?.tool_config?.api_schema?.url ?? t?.api_schema?.url ?? '';
      const kind = url ? 'webhook' : 'client';
      console.log(`      ${(t?.tool_config?.name ?? t?.name ?? t.id ?? '?').padEnd(20)} ${kind.padEnd(8)} ${url}`);
    }
  }
}

console.log('\n  Done. Commit the file so the change is on the record.\n');
