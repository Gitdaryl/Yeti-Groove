# Voice agents: config as code

Every conversational agent the studio runs is listed in `agents.json`, and its
settings live as a JSON file in the project that owns it. These two scripts move
that file between disk and ElevenLabs.

The point is that an agent's prompt, voice and tools stop being something
somebody clicked in a dashboard once, and become something with a history you
can read, review and undo.

## Why this exists

On 2026-09-04 the committed config for the Manitou Beach concierge said it had
zero tools. The live agent had seven. Nobody lied: it had been exported once in
March and edited in a browser for five months. A config file that disagrees with
production is worse than having none, because it gets trusted.

It also unlocks the correction loop. When a customer gets a wrong answer and the
fix has to be folded back into what the agent knows, that is an edit to a file
and a push. It is not possible at all if the knowledge only exists behind a
login.

## One-time setup

You need an ElevenLabs API key with Conversational AI access.

1. Sign in at https://elevenlabs.io
2. Click your avatar, bottom left, then **API Keys**
3. Create one and copy it
4. In Terminal, for that window only:

```
export ELEVENLABS_API_KEY="paste-it-here"
```

The key is never stored in this repo. If you want it to persist across Terminal
windows, put that line in `~/.zshrc`, and understand that it then sits in a
plaintext file on this machine.

## Daily use

Run these from the `Yeti-Groove` folder.

**See what is actually live, and write it to the file:**

```
node tools/agent-pull.mjs manitou-beach
```

**See what your edits would change, without changing anything:**

```
node tools/agent-push.mjs manitou-beach
```

**Actually apply them:**

```
node tools/agent-push.mjs manitou-beach --yes
```

`--all` works on pull, to refresh every agent at once.

## The safety rules, and why

**Push is a dry run unless you type `--yes`.** These agents answer real people.
A wrong voice id or a broken prompt is an outage nobody reports, because
visitors do not file bugs, they just leave.

**Every push backs up the live config first**, to `agent_configs/.backups/`.
Those backups are worth keeping: they capture what production looked like
*before* the file existed, which git cannot tell you. To roll back, copy a
backup over the config file and push it.

**Push verifies by reading the agent back.** A 200 means the request was
accepted, not that anything changed. If a field did not take, the script says so
and exits non-zero. Verify on the result, never on the attempt.

**Only three fields are ever sent:** `name`, `conversation_config` and
`platform_settings`. Anything else in the file is descriptive or one of our own
annotations, and the script tells you what it dropped.

Anything starting with `_` is ours, not ElevenLabs'. `_tools` is the expanded
tool definitions, written by pull so a diff shows a real URL instead of an
opaque id. It is stripped before sending.

## Adding an agent

Add a row to `agents.json` with a slug, the agent id, the repo that owns it, and
the path to its config file inside that repo. Then pull it.

Agent ids are safe to commit. They are already served to every visitor in the
website bundle, because Vite inlines `VITE_*` variables at build time. The API
key is the secret. The agent id is not.

## Moving to another machine

Config paths resolve as `<projectsDir>/<repo>/<configPath>`, where `projectsDir`
defaults to `~/Projects`. If the repos live elsewhere:

```
export YETI_PROJECTS_DIR=/path/to/your/projects
```

No `npm install` is needed. The scripts use only what Node ships with, so they
keep working on a machine where nobody remembers the setup steps.
