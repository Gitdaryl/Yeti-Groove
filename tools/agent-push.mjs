#!/usr/bin/env node
// Push a config file back to the live ElevenLabs agent.
//
//   node tools/agent-push.mjs manitou-beach          # dry run, shows what would change
//   node tools/agent-push.mjs manitou-beach --yes    # actually apply it
//
// DRY RUN BY DEFAULT, and that is not politeness. This agent answers the phone
// for a real community. A bad prompt or a wrong voice id is a live outage that
// nobody reports, because visitors do not file bugs, they just leave.
//
// Before writing anything it takes a timestamped backup of whatever is live, so
// there is always a file to push back. Restore is just:
//
//   cp agent_configs/.backups/<slug>-<stamp>.json agent_configs/<name>.json
//   node tools/agent-push.mjs <slug> --yes

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { API, call, die, loadRegistry, pick, summarise, printSummary, PUSHABLE } from './_agents-lib.mjs';

const args = process.argv.slice(2);
const apply = args.includes('--yes');
const a = pick(loadRegistry(), args.find((x) => !x.startsWith('--')));

let local;
try {
  local = JSON.parse(readFileSync(a.resolvedPath, 'utf8'));
} catch (e) {
  die(`Could not read ${a.resolvedPath}\n  ${e.message}\n\n  Run agent-pull.mjs first.`);
}

if (!local.conversation_config) {
  die(`${a.resolvedPath} has no conversation_config. Refusing to push a file that is not an agent config.`);
}

// Only send the writable fields. Everything else in the file is either
// descriptive (agent_id, metadata) or our own annotation (_tools, _pulledAt).
const body = {};
const dropped = [];
for (const [k, v] of Object.entries(local)) {
  if (PUSHABLE.includes(k)) body[k] = v;
  else dropped.push(k);
}

// The API is asymmetric here. GET returns the same tools twice: once as
// `tool_ids`, and once as `tools` with the full inline definitions. PATCH then
// refuses the pair outright, with "Cannot specify both tools and tool IDs".
// tool_ids is the modern form and the one the dashboard edits, so the inline
// copy is what goes. It stays in the FILE on purpose, because a diff showing a
// webhook URL is worth reading; it just never gets sent.
const prompt = body?.conversation_config?.agent?.prompt;
let strippedTools = 0;
if (Array.isArray(prompt?.tools) && Array.isArray(prompt?.tool_ids)) {
  // Clone first: body.conversation_config is the same object as local's, and
  // deleting in place would quietly edit the file's in-memory copy too.
  body.conversation_config = structuredClone(body.conversation_config);
  strippedTools = prompt.tools.length;
  delete body.conversation_config.agent.prompt.tools;
}

console.log(`\n  ${a.name}  (${a.agentId})`);
console.log(`  file  ${a.resolvedPath}`);
if (dropped.length) console.log(`  not sent (read-only or annotation): ${dropped.join(', ')}`);
if (strippedTools) {
  console.log(`  not sent: ${strippedTools} inline tool definitions, keeping ${prompt.tool_ids.length} tool_ids (the API rejects both)`);
}

const live = await call(`${API}/agents/${a.agentId}`);
const before = summarise(live);
const after = summarise(local);

console.log('');
printSummary('live now', before);
console.log('');
printSummary('file says', after);

const changes = Object.keys(after).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
const promptChanged =
  JSON.stringify(live?.conversation_config?.agent?.prompt?.prompt) !==
  JSON.stringify(local?.conversation_config?.agent?.prompt?.prompt);
if (promptChanged) changes.push('system prompt');

console.log('');
if (!changes.length) {
  console.log('  No difference in the fields this tool summarises.');
  console.log('  A push would still send the whole conversation_config, so run it if you edited something deeper.\n');
} else {
  console.log(`  Would change: ${changes.join(', ')}\n`);
}

if (!apply) {
  console.log('  Dry run. Nothing was sent. Re-run with --yes to apply.\n');
  process.exit(0);
}

// Back up what is live before overwriting it.
const backupDir = path.join(path.dirname(a.resolvedPath), '.backups');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = path.join(backupDir, `${a.slug}-${stamp}.json`);
mkdirSync(backupDir, { recursive: true });
writeFileSync(backup, `${JSON.stringify(live, null, 2)}\n`);
console.log(`  Backed up the live config to ${backup}`);

await call(`${API}/agents/${a.agentId}`, { method: 'PATCH', body: JSON.stringify(body) });

// Read it back. A 200 means the request was accepted, not that the agent now
// looks the way the file says. Verify on the result, never on the attempt.
const liveAfter = await call(`${API}/agents/${a.agentId}`);
const verify = summarise(liveAfter);
const stillWrong = Object.keys(after).filter((k) => JSON.stringify(verify[k]) !== JSON.stringify(after[k]));

// The summary above covers models, voice and tool counts. It does NOT cover the
// system prompt, which is usually the whole reason for a push. Checking it
// separately, because "verified" that skips the field you changed is worse than
// no check at all: it is a green light nobody earned.
const wantPrompt = local?.conversation_config?.agent?.prompt?.prompt ?? '';
const gotPrompt = liveAfter?.conversation_config?.agent?.prompt?.prompt ?? '';
if (wantPrompt !== gotPrompt) {
  stillWrong.push(`system prompt (sent ${wantPrompt.length} chars, agent now has ${gotPrompt.length})`);
} else if (wantPrompt) {
  console.log(`\n  system prompt matches, ${gotPrompt.length} chars`);
}

console.log('');
printSummary('live after push', verify);
if (stillWrong.length) {
  console.log(`\n  WARNING: these did not take: ${stillWrong.join(', ')}`);
  console.log('  The API accepted the request but the value did not change. Check for a read-only field.\n');
  process.exit(2);
}
console.log('\n  Pushed and verified. Commit the file.\n');
