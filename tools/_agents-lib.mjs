// Shared plumbing for agent-pull and agent-push.
//
// No dependencies on purpose. This has to keep working on a machine that is not
// Daryl's, years from now, after an npm install would have been the thing nobody
// remembered to run.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const API = 'https://api.elevenlabs.io/v1/convai';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(HERE, 'agents.json');

// PATCH rejects read-only fields, so only these three ever go back up.
// Everything else the GET returns (agent_id, metadata, access_info) is
// descriptive and belongs in the file for review, not in the request.
export const PUSHABLE = ['name', 'conversation_config', 'platform_settings'];

export function die(msg) {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
}

export function apiKey() {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) {
    die(
      'ELEVENLABS_API_KEY is not set.\n\n' +
        '  Get one at https://elevenlabs.io  ->  your avatar, bottom left  ->  API Keys.\n' +
        '  Then run it for this shell only:\n\n' +
        '    export ELEVENLABS_API_KEY="paste-it-here"\n\n' +
        '  Do not put it in agents.json and do not commit it.'
    );
  }
  return k;
}

export function expandHome(p) {
  return p.startsWith('~') ? path.join(homedir(), p.slice(1)) : p;
}

export function loadRegistry() {
  let reg;
  try {
    reg = JSON.parse(readFileSync(REGISTRY, 'utf8'));
  } catch (e) {
    die(`Could not read ${REGISTRY}: ${e.message}`);
  }
  const base = expandHome(process.env.YETI_PROJECTS_DIR || reg.projectsDir || '~/Projects');
  for (const a of reg.agents) a.resolvedPath = path.join(base, a.repo, a.configPath);
  return reg;
}

export function pick(reg, slug) {
  if (!slug) {
    const names = reg.agents.map((a) => `    ${a.slug.padEnd(18)} ${a.name}`).join('\n');
    die(`Which agent?\n\n${names}\n\n  Or pass --all (pull only).`);
  }
  const a = reg.agents.find((x) => x.slug === slug);
  if (!a) die(`No agent with slug "${slug}" in agents.json.`);
  return a;
}

// Every call goes through here so a failure prints the status AND the body.
// A silent null return is exactly the failure mode that let the reindex cron
// report itself healthy for a week while indexing nothing.
export async function call(url, opts = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...opts,
      headers: { 'xi-api-key': apiKey(), 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });
  } catch (e) {
    die(`Network error calling ${url}\n  ${e.message}`);
  }
  const text = await res.text();
  if (!res.ok) {
    const hint =
      res.status === 401
        ? '\n  401 means the key is wrong, revoked, or lacks Conversational AI permission.'
        : res.status === 404
          ? '\n  404 means that id does not exist on this account.'
          : '';
    die(`${opts.method || 'GET'} ${url}\n  HTTP ${res.status}\n  ${text.slice(0, 500)}${hint}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// A one-line read on the things that actually break: which models it runs,
// how many tools it has, whether retrieval is on.
export function summarise(cfg) {
  const agent = cfg?.conversation_config?.agent ?? {};
  const prompt = agent.prompt ?? {};
  const tts = cfg?.conversation_config?.tts ?? {};
  return {
    name: cfg?.name ?? '(unnamed)',
    llm: prompt.llm ?? '(unset)',
    tts: tts.model_id ?? '(unset)',
    voice: tts.voice_id ?? '(unset)',
    tools: (prompt.tool_ids ?? []).length,
    ragEnabled: prompt.rag?.enabled === true,
    knowledgeBase: (prompt.knowledge_base ?? []).length,
  };
}

export function printSummary(label, s) {
  console.log(`  ${label}`);
  console.log(`    name          ${s.name}`);
  console.log(`    llm           ${s.llm}`);
  console.log(`    tts model     ${s.tts}`);
  console.log(`    voice         ${s.voice}`);
  console.log(`    tools         ${s.tools}`);
  console.log(`    rag enabled   ${s.ragEnabled}`);
  console.log(`    kb documents  ${s.knowledgeBase}`);
}
