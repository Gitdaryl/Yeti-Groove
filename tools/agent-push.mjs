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

console.log(`\n  ${a.name}  (${a.agentId})`);
console.log(`  file  ${a.resolvedPath}`);
if (dropped.length) console.log(`  not sent (read-only or annotation): ${dropped.join(', ')}`);

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
const verify = summarise(await call(`${API}/agents/${a.agentId}`));
const stillWrong = Object.keys(after).filter((k) => JSON.stringify(verify[k]) !== JSON.stringify(after[k]));

console.log('');
printSummary('live after push', verify);
if (stillWrong.length) {
  console.log(`\n  WARNING: these did not take: ${stillWrong.join(', ')}`);
  console.log('  The API accepted the request but the value did not change. Check for a read-only field.\n');
  process.exit(2);
}
console.log('\n  Pushed and verified. Commit the file.\n');
