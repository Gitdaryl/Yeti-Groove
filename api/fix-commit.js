// Emergency Fix Agent - Phase 2: Commit & Create PR
// Creates an emergency-fix branch, commits the fixed file, opens a PR,
// and optionally logs the action to Notion.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    repo, filePath, branch = 'main',
    fixedContent, instruction, diff,
    complexity, modelUsed, token
  } = req.body || {};

  if (!token || token !== process.env.FIX_AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!repo || !filePath || !fixedContent || !instruction) {
    return res.status(400).json({ error: 'repo, filePath, fixedContent, and instruction are required' });
  }

  const now       = new Date();
  const stamp     = now.toISOString().slice(0, 16).replace('T', '-').replace(':', '-');
  const fixBranch = `emergency-fix/${stamp}`;
  const baseUrl   = `https://api.github.com/repos/Gitdaryl/${encodeURIComponent(repo)}`;

  const ghHeaders = {
    Authorization:  `Bearer ${process.env.GITHUB_PAT}`,
    Accept:         'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent':   'YetiGroove-EmergencyFix/1.0'
  };

  try {
    // 1. Get the current tip SHA of the base branch
    const branchRes = await fetch(
      `${baseUrl}/branches/${encodeURIComponent(branch)}`,
      { headers: ghHeaders }
    );
    if (!branchRes.ok) throw new Error(`Cannot read branch "${branch}" in ${repo}`);
    const { commit: { sha: baseSha } } = await branchRes.json();

    // 2. Create the emergency-fix branch from that SHA
    const createRef = await fetch(`${baseUrl}/git/refs`, {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ ref: `refs/heads/${fixBranch}`, sha: baseSha })
    });
    if (!createRef.ok) {
      const e = await createRef.json();
      throw new Error(`Create branch failed: ${e.message}`);
    }

    // 3. Get the current file SHA on the new branch (required by GitHub for updates)
    const fileRes = await fetch(
      `${baseUrl}/contents/${filePath}?ref=${encodeURIComponent(fixBranch)}`,
      { headers: ghHeaders }
    );
    if (!fileRes.ok) throw new Error(`Cannot read "${filePath}" on new branch`);
    const { sha: fileSha } = await fileRes.json();

    // 4. Commit the fixed file
    const commitMsg =
      `fix: ${instruction.slice(0, 70)}\n\n` +
      `[emergency mobile fix - model: ${modelUsed || 'unknown'}, complexity: ${complexity || 'unknown'}]`;

    const commitRes = await fetch(`${baseUrl}/contents/${filePath}`, {
      method:  'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: commitMsg,
        content: Buffer.from(fixedContent).toString('base64'),
        sha:     fileSha,
        branch:  fixBranch
      })
    });
    if (!commitRes.ok) {
      const e = await commitRes.json();
      throw new Error(`Commit failed: ${e.message}`);
    }

    // 5. Open a pull request
    const shortInst = instruction.length > 62
      ? instruction.slice(0, 59) + '...'
      : instruction;

    const prBody = [
      '## Emergency Mobile Fix',
      '',
      `**Instruction:** ${instruction}`,
      `**File:** \`${filePath}\``,
      `**Branch:** \`${branch}\``,
      `**Model:** ${modelUsed} | **Complexity:** ${complexity}`,
      `**Time:** ${now.toISOString()}`,
      '',
      '### Diff',
      '```diff',
      diff || '(no diff available)',
      '```',
      '',
      '---',
      '*Created by Yeti Groove Emergency Fix Agent*'
    ].join('\n');

    const prRes = await fetch(`${baseUrl}/pulls`, {
      method:  'POST',
      headers: ghHeaders,
      body: JSON.stringify({
        title: `Emergency fix: ${shortInst}`,
        body:  prBody,
        head:  fixBranch,
        base:  branch
      })
    });
    if (!prRes.ok) {
      const e = await prRes.json();
      throw new Error(`PR creation failed: ${e.message}`);
    }
    const prData = await prRes.json();
    const prUrl  = prData.html_url;

    // 6. Log to Notion (optional - gracefully skipped if env vars not set)
    if (process.env.NOTION_TOKEN && process.env.NOTION_DB_EMERGENCY_FIXES) {
      try {
        await logToNotion({ repo, filePath, instruction, complexity, modelUsed, prUrl, now });
      } catch (notionErr) {
        console.warn('[fix-commit] Notion logging failed (non-fatal):', notionErr.message);
      }
    }

    return res.json({ prUrl, branch: fixBranch });

  } catch (err) {
    console.error('[fix-commit]', err);
    return res.status(500).json({ error: err.message });
  }
};

async function logToNotion({ repo, filePath, instruction, complexity, modelUsed, prUrl, now }) {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization:    `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type':   'application/json'
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_DB_EMERGENCY_FIXES },
      properties: {
        Name:        { title:     [{ text: { content: `${repo}/${filePath} - ${now.toISOString().slice(0, 10)}` } }] },
        Repo:        { rich_text: [{ text: { content: repo } }] },
        File:        { rich_text: [{ text: { content: filePath } }] },
        Instruction: { rich_text: [{ text: { content: instruction.slice(0, 2000) } }] },
        Complexity:  { select: { name: complexity } },
        Model:       { select: { name: modelUsed } },
        PR:          { url: prUrl },
        Date:        { date: { start: now.toISOString() } }
      }
    })
  });
  if (!response.ok) {
    const e = await response.json().catch(() => ({}));
    throw new Error(`Notion API ${response.status}: ${e.message || 'unknown'}`);
  }
}
